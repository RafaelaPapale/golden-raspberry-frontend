import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { Navbar } from "@/src/components/layout/navbar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Navbar", () => {
  it("renderiza o link com o nome da aplicação", () => {
    render(<Navbar />);
    expect(
      screen.getByText("Golden Raspberry Awards")
    ).toBeInTheDocument();
  });

  it("renderiza os dois itens de navegação", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Movies List/i })
    ).toBeInTheDocument();
  });

  it("link Dashboard aponta para /", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toHaveAttribute("href", "/");
  });

  it("link Lista de filmes aponta para /movies", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Movies List/i })
    ).toHaveAttribute("href", "/movies");
  });

  it("Dashboard tem aria-current=page na rota /", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /Movies List/i })
    ).not.toHaveAttribute("aria-current");
  });

  it("Lista de filmes tem aria-current=page na rota /movies", () => {
    vi.mocked(usePathname).mockReturnValue("/movies");
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Movies List/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).not.toHaveAttribute("aria-current");
  });

  it("nenhum link tem aria-current em rota desconhecida", () => {
    vi.mocked(usePathname).mockReturnValue("/outra-rota");
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /Dashboard/i })
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: /Movies List/i })
    ).not.toHaveAttribute("aria-current");
  });

  it("contém um elemento <nav> acessível", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
