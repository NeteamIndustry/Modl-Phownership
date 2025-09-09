import Types "./Types";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module {
  public class Storage(capacity : Nat) {
    public var store = HashMap.HashMap<Text, Types.Entry>(capacity, Text.equal, Text.hash);
    public var byOwner = HashMap.HashMap<Text, [Text]>(capacity, Text.equal, Text.hash);

    public func put(e : Types.Entry) { store.put(e.photoId, e) };
    public func get(id : Text) : ?Types.Entry { store.get(id) };

    public func pushOwner(ownerId : Text, photoId : Text) {
      switch (byOwner.get(ownerId)) {
        case (?arr) { byOwner.put(ownerId, Array.append(arr, [photoId])) };
        case null { byOwner.put(ownerId, [photoId]) };
      }
    };

    public func getOwnerIds(ownerId : Text) : ?[Text] { byOwner.get(ownerId) };

    public func entries() : Iter.Iter<(Text, Types.Entry)> { store.entries() };
    public func ownerEntries() : Iter.Iter<(Text, [Text])> { byOwner.entries() };

    public func setAll(kv : [(Text, Types.Entry)], idx : [(Text, [Text])]) {
      store := HashMap.HashMap<Text, Types.Entry>(kv.size(), Text.equal, Text.hash);
      for ((k, v) in kv.vals()) { store.put(k, v) };
      byOwner := HashMap.HashMap<Text, [Text]>(idx.size(), Text.equal, Text.hash);
      for ((k, v) in idx.vals()) { byOwner.put(k, v) };
    };
  };
}
