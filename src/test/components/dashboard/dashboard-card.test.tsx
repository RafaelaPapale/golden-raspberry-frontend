import { render, screen } from "@testing-library/react";
import type { LucideIcon } from "lucide-react";
import { describe, expect, it } from "vitest";
import { DashboardCard } from "@/src/components/dashboard/dashboard-card";

function TestIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg data-testid="test-icon" {...props} />;
}

const icon = TestIcon as unknown as LucideIcon;

describe("DashboardCard", () => {
  it("renderiza o título", () => {
    render(<DashboardCard title="Meu Painel" icon={icon}>conteúdo</DashboardCard>);
    expect(screen.getByText("Meu Painel")).toBeInTheDocument();
  });

  it("renderiza os filhos (children)", () => {
    render(
      <DashboardCard title="Painel" icon={icon}>
        <span data-testid="child">filho</span>
      </DashboardCard>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("filho")).toBeInTheDocument();
  });

  it("ícone recebe aria-hidden", () => {
    render(<DashboardCard title="Painel" icon={icon}>x</DashboardCard>);
    expect(screen.getByTestId("test-icon")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("título e ícone ficam no mesmo container (CardHeader)", () => {
    render(<DashboardCard title="Painel" icon={icon}>x</DashboardCard>);
    const title = screen.getByText("Painel");
    const iconEl = screen.getByTestId("test-icon");
    // Ambos devem estar dentro do mesmo elemento pai
    expect(title.parentElement).toContainElement(iconEl);
  });
});
