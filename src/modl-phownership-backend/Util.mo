import Nat8  "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat   "mo:base/Nat";
import Char  "mo:base/Char";
import Text  "mo:base/Text";
import Array "mo:base/Array";

module {
  // 1 hex char -> 0..15
  func hexNibble(c : Char) : ?Nat8 {
    let n : Nat = Nat32.toNat(Char.toNat32(c));
    if (n >= 48 and n <= 57)       { ?Nat8.fromNat(n - 48) }       // '0'..'9'
    else if (n >= 97 and n <= 102) { ?Nat8.fromNat(10 + n - 97) }  // 'a'..'f'
    else if (n >= 65 and n <= 70)  { ?Nat8.fromNat(10 + n - 65) }  // 'A'..'F'
    else null
  };

  // "a1ff..." -> bytes
  public func hexToBytes(t : Text) : ?[Nat8] {
    let chars = Text.toArray(t);
    if (chars.size() % 2 != 0) { return null };
    let len = chars.size() / 2;
    var out : [var Nat8] = Array_init<Nat8>(len, Nat8.fromNat(0));
    var i : Nat = 0;
    while (i < len) {
      switch (hexNibble(chars[i * 2]), hexNibble(chars[i * 2 + 1])) {
        case (?hi, ?lo) {
          // (hi << 4) | lo
          out[i] := Nat8.bitor(Nat8.bitshiftLeft(hi, 4), lo);
        };
        case _ { return null };
      };
      i += 1;
    };
    ?Array_thaw<Nat8>(out)
  };

  // popcount untuk 1 byte
  func popcount8(b : Nat8) : Nat {
    var x : Nat8 = b;
    var c : Nat = 0;
    var i : Nat = 0;
    while (i < 8) {
      if (Nat8.toNat(Nat8.bitand(x, Nat8.fromNat(1))) == 1) { c += 1 };
      x := Nat8.bitshiftRight(x, 1);
      i += 1;
    };
    c
  };

  // Hamming distance antara dua hex string (bit-level)
  public func hammingHex(a : Text, b : Text) : ?Nat {
    switch (hexToBytes(a), hexToBytes(b)) {
      case (?xa, ?xb) {
        if (xa.size() != xb.size()) { return null };
        var sum : Nat = 0;
        var i : Nat = 0;
        while (i < xa.size()) {
          sum += popcount8(Nat8.bitxor(xa[i], xb[i]));
          i += 1;
        };
        ?sum
      };
      case _ { null }
    }
  };

  // helpers array var
  func Array_init<T>(n : Nat, v : T) : [var T] {
    Array.thaw<T>(Array.tabulate<T>(n, func (_ : Nat) : T { v }))
  };
  func Array_thaw<T>(a : [var T]) : [T] {
    Array.freeze<T>(a)
  };
}
