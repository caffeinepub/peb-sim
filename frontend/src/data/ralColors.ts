export interface RALColor {
  code: string;
  name: string;
  hex: string;
}

export const RAL_COLORS: RALColor[] = [
  { code: "RAL 9016", name: "Traffic White", hex: "#F1F0EA" },
  { code: "RAL 9001", name: "Cream White", hex: "#FDF4E3" },
  { code: "RAL 9006", name: "White Aluminium", hex: "#A5A5A5" },
  { code: "RAL 9007", name: "Grey Aluminium", hex: "#8F8F8F" },
  { code: "RAL 7016", name: "Anthracite Grey", hex: "#2E3436" },
  { code: "RAL 7035", name: "Light Grey", hex: "#D7D7D7" },
  { code: "RAL 7040", name: "Window Grey", hex: "#9DA3A6" },
  { code: "RAL 7042", name: "Traffic Grey A", hex: "#8E9291" },
  { code: "RAL 5010", name: "Gentian Blue", hex: "#0E4C96" },
  { code: "RAL 5015", name: "Sky Blue", hex: "#2271B3" },
  { code: "RAL 5024", name: "Pastel Blue", hex: "#578CA9" },
  { code: "RAL 6005", name: "Moss Green", hex: "#2F4538" },
  { code: "RAL 6011", name: "Reseda Green", hex: "#587246" },
  { code: "RAL 6018", name: "Yellow Green", hex: "#57A639" },
  { code: "RAL 3000", name: "Flame Red", hex: "#AF2B1E" },
  { code: "RAL 3020", name: "Traffic Red", hex: "#CC0605" },
  { code: "RAL 3009", name: "Oxide Red", hex: "#6D3B2E" },
  { code: "RAL 8017", name: "Chocolate Brown", hex: "#45322E" },
  { code: "RAL 1003", name: "Signal Yellow", hex: "#F9A800" },
  { code: "RAL 1023", name: "Traffic Yellow", hex: "#FAD201" },
  { code: "RAL 2004", name: "Pure Orange", hex: "#F44611" },
  { code: "RAL 4005", name: "Blue Lilac", hex: "#6C6874" },
  { code: "RAL 6003", name: "Olive Green", hex: "#424632" },
  { code: "RAL 9005", name: "Jet Black", hex: "#0A0A0A" },
  { code: "RAL 9010", name: "Pure White", hex: "#F4F4F4" },
];

export const DEFAULT_RAL_COLORS = {
  roof: RAL_COLORS.find(c => c.code === "RAL 7016")!,
  wall: RAL_COLORS.find(c => c.code === "RAL 9006")!,
  trim: RAL_COLORS.find(c => c.code === "RAL 9001")!,
  structure: RAL_COLORS.find(c => c.code === "RAL 7035")!,
};
