import { describe, expect, it } from "vitest";
import { cn } from "@/src/lib/utils";

describe("cn", () => {
  it("retorna uma string com classes concatenadas", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignora valores falsy", () => {
    expect(cn("foo", false && "bar", undefined, null, "baz")).toBe("foo baz");
  });

  it("resolve conflitos de classe tailwind (a última vence)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("mantém classes não-conflitantes de ambos os argumentos", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("py-1");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("lida com arrays de classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("lida com objetos de classes condicionais", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("retorna string vazia quando não há classes", () => {
    expect(cn()).toBe("");
    expect(cn(undefined, null, false)).toBe("");
  });

  it("deduplicação correta de variantes arbitrárias", () => {
    expect(cn("text-[14px]", "text-[16px]")).toBe("text-[16px]");
  });
});
