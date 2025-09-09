module {
  public type EntryInput = {
    photoId : Text;
    ownerId : Text;
    sha256Master : Text;
    pHash : Text;        // hex (contoh: 64 hex chars untuk 256-bit)
    timestamp : Text;    // ISO string
    wmScheme : Text;     // "dwtDct@imwatermark-v1"
    webFile : Text;      // URL/CID atau nama file
  };

  public type Entry = {
    photoId : Text;
    ownerId : Text;
    sha256Master : Text;
    pHash : Text;
    timestamp : Text;
    wmScheme : Text;
    webFile : Text;
    createdAtNs : Nat64;
    updatedAtNs : Nat64;
  };

  public type Match = { photoId : Text; ownerId : Text; distance : Nat };

  public type VerifyPHashResp = {
    ok : Bool;
    distance : Nat;
    photoId : Text;
    ownerId : Text;
  };

  public type WatermarkSpec = {
    wmScheme : Text;
    payload : Text;   // yang di-encode (kita pakai photoId)
    bitLength : Nat;  // len(payload)*8
  };
}
