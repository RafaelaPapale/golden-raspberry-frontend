import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PanelStatus } from "@/src/components/dashboard/panel-status";

describe("PanelStatus — estado loading", () => {
  it("renderiza container com aria-busy=true", () => {
    render(
      <PanelStatus isLoading isError={false}>
        conteúdo
      </PanelStatus>
    );
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("não renderiza children durante loading", () => {
    render(
      <PanelStatus isLoading isError={false}>
        <span data-testid="child" />
      </PanelStatus>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("renderiza 3 skeletons por padrão", () => {
    render(
      <PanelStatus isLoading isError={false}>
        x
      </PanelStatus>
    );
    expect(
      document.querySelectorAll("[data-slot='skeleton']")
    ).toHaveLength(3);
  });

  it("renderiza N skeletons conforme prop rows", () => {
    render(
      <PanelStatus isLoading isError={false} rows={5}>
        x
      </PanelStatus>
    );
    expect(
      document.querySelectorAll("[data-slot='skeleton']")
    ).toHaveLength(5);
  });
});

describe("PanelStatus — estado de erro", () => {
  it("renderiza mensagem de erro", () => {
    render(
      <PanelStatus isLoading={false} isError>
        x
      </PanelStatus>
    );
    expect(
      screen.getByText(/No data could be loaded/)
    ).toBeInTheDocument();
  });

  it("não renderiza children no estado de erro", () => {
    render(
      <PanelStatus isLoading={false} isError>
        <span data-testid="child" />
      </PanelStatus>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });
});

describe("PanelStatus — estado vazio", () => {
  it("renderiza mensagem de lista vazia", () => {
    render(
      <PanelStatus isLoading={false} isError={false} isEmpty>
        x
      </PanelStatus>
    );
    expect(screen.getByText(/No data available/)).toBeInTheDocument();
  });

  it("não renderiza children no estado vazio", () => {
    render(
      <PanelStatus isLoading={false} isError={false} isEmpty>
        <span data-testid="child" />
      </PanelStatus>
    );
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });
});

describe("PanelStatus — estado de sucesso", () => {
  it("renderiza children quando tudo está ok", () => {
    render(
      <PanelStatus isLoading={false} isError={false}>
        <span data-testid="child">conteúdo</span>
      </PanelStatus>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });

  it("loading tem precedência sobre erro", () => {
    render(
      <PanelStatus isLoading isError>
        x
      </PanelStatus>
    );
    expect(
      document.querySelector("[aria-busy='true']")
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Não foi possível/)
    ).not.toBeInTheDocument();
  });

  it("erro tem precedência sobre isEmpty", () => {
    render(
      <PanelStatus isLoading={false} isError isEmpty>
        x
      </PanelStatus>
    );
    expect(
      screen.getByText(/No data could be loaded/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/No data available/)
    ).not.toBeInTheDocument();
  });
});
