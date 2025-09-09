import Types "./Types";
import Util "./Util";
import Storage "./Storage";

import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Order "mo:base/Order";

persistent actor {
  // data yang dipersist saat upgrade
  stable var storeStable : [(Text, Types.Entry)] = [];
  stable var byOwnerStable : [(Text, [Text])] = [];

  // in-memory DB (tidak dipersist; akan direkonstruksi saat postupgrade)
  transient let db = Storage.Storage(64);

  system func preupgrade() {
    storeStable := Iter.toArray(db.entries());
    byOwnerStable := Iter.toArray(db.ownerEntries());
  };

  system func postupgrade() {
    db.setAll(storeStable, byOwnerStable);
  };

  func nowNs() : Nat64 { Nat64.fromIntWrap(Time.now()) };

  // ---------- Core registry ----------
  public shared func register(e : Types.EntryInput) : async Result.Result<Types.Entry, Text> {
    if (Text.size(e.photoId) == 0 or Text.size(e.ownerId) == 0) return #err("photoId/ownerId kosong");

    // validasi ringan pHash (hex & panjang genap)
    switch (Util.hexToBytes(e.pHash)) {
      case null { return #err("pHash bukan hex valid") };
      case _ {};
    };

    let ts = nowNs();
    let newEntry : Types.Entry = switch (db.get(e.photoId)) {
      case (?old) {
        {
          photoId = e.photoId; ownerId = e.ownerId;
          sha256Master = e.sha256Master; pHash = e.pHash;
          timestamp = e.timestamp; wmScheme = e.wmScheme; webFile = e.webFile;
          createdAtNs = old.createdAtNs; updatedAtNs = ts
        }
      };
      case null {
        db.pushOwner(e.ownerId, e.photoId);
        {
          photoId = e.photoId; ownerId = e.ownerId;
          sha256Master = e.sha256Master; pHash = e.pHash;
          timestamp = e.timestamp; wmScheme = e.wmScheme; webFile = e.webFile;
          createdAtNs = ts; updatedAtNs = ts
        }
      };
    };
    db.put(newEntry);
    #ok(newEntry)
  };

  public query func get(photoId : Text) : async ?Types.Entry { db.get(photoId) };
  public query func exists(photoId : Text) : async Bool { switch (db.get(photoId)) { case (?_) true; case null false } };

 public query func listByOwner(ownerId : Text, offset : Nat, limit : Nat) : async [Types.Entry] {
  switch (db.getOwnerIds(ownerId)) {
    case null { [] };
    case (?ids) {
      if (offset >= ids.size()) { return [] };

      // hitung window [offset, end)
      let end0 : Nat = offset + limit;
      let end  : Nat = if (end0 > ids.size()) ids.size() else end0;
      let sliceLen : Nat = end - offset;

      let sliceIds : [Text] = Array.tabulate<Text>(
        sliceLen,
        func (i : Nat) : Text { ids[offset + i] }
      );

      Array.map<Text, Types.Entry>(sliceIds, func (pid : Text) : Types.Entry {
        switch (db.get(pid)) {
          case (?e) e;
          case null {
            // fallback (seharusnya gak kejadian), isi placeholder supaya tipe pas
            {
              photoId = pid;
              ownerId = ownerId;
              sha256Master = "";
              pHash = "";
              timestamp = "";
              wmScheme = "";
              webFile = "";
              createdAtNs = 0;
              updatedAtNs = 0;
            }
          }
        }
      })
    }
  }
};


  // ---------- Watermark helper ----------
  /// Agent Python kamu butuh payload & bit-length untuk decode.
  public query func getWatermarkSpec(photoId : Text) : async ?Types.WatermarkSpec {
    switch (db.get(photoId)) {
      case null null;
      case (?e) ?{ wmScheme = e.wmScheme; payload = e.photoId; bitLength = Text.size(e.photoId) * 8 }
    }
  };

  // ---------- pHash tolerant verification ----------
  /// Verifikasi kalau kamu SUDAH tahu photoId-nya; kirim pHash kandidat + threshold maxDistance.
  public query func verifyPHash(photoId : Text, candidatePHashHex : Text, maxDistance : Nat) : async ?Types.VerifyPHashResp {
    switch (db.get(photoId)) {
      case null null;
      case (?e) {
        switch (Util.hammingHex(e.pHash, candidatePHashHex)) {
          case null null;
          case (?d) ?{ ok = d <= maxDistance; distance = d; photoId = e.photoId; ownerId = e.ownerId }
        }
      }
    }
  };

  /// Cari best-match di seluruh registry untuk pHash kandidat (buat kasus screenshot).
  public query func bestMatchByPHash(candidatePHashHex : Text, limit : Nat) : async [Types.Match] {
    // validasi kandidat dulu
    switch (Util.hexToBytes(candidatePHashHex)) { case null return []; case _ {} };

    var tmp : [(Nat, Text, Text)] = []; // (distance, photoId, ownerId)

    for ((_, e) in db.entries()) {
      switch (Util.hammingHex(e.pHash, candidatePHashHex)) {
        case (?d) { tmp := Array.append(tmp, [(d, e.photoId, e.ownerId)]) };
        case null {}; // skip jika pHash tidak seragam panjangnya
      }
    };

    // sort ascending by distance
    let sorted = Array.sort<(Nat, Text, Text)>(tmp, func(a, b) {
      if (a.0 < b.0)      { #less }
      else if (a.0 > b.0) { #greater }
      else                { #equal }
    });

    let k = if (limit < sorted.size()) limit else sorted.size();
    let top = Array.tabulate<Types.Match>(k, func(i : Nat) : Types.Match {
      let t = sorted[i];
      { distance = t.0; photoId = t.1; ownerId = t.2 }
    });
    top
  };
}
