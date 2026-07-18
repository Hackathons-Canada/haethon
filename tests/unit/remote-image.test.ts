import { describe, expect, it } from "vitest";

import { detectImageContentType, isPrivateOrReservedAddress } from "@/lib/security/remote-image";

describe("remote image security", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "192.168.1.1",
    "::1",
    "fe80::1",
    "fc00::1",
    "::ffff:127.0.0.1",
  ])("blocks private or reserved address %s", (address) => {
    expect(isPrivateOrReservedAddress(address)).toBe(true);
  });

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows public address %s", (address) => {
    expect(isPrivateOrReservedAddress(address)).toBe(false);
  });

  it("recognizes supported raster signatures rather than trusting headers", () => {
    expect(detectImageContentType(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))).toBe("image/png");
    expect(detectImageContentType(Uint8Array.from([255, 216, 255, 224]))).toBe("image/jpeg");
    expect(detectImageContentType(new TextEncoder().encode("<svg><script/></svg>"))).toBeNull();
  });
});
