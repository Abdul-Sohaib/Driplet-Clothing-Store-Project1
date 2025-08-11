import type { Config } from "tailwindcss";

// Ensure we EXTEND default screens so sm/md/lg/xl/2xl keep working
export default {
  theme: {
    extend: {
      screens: {
        xs: "425px",
      },
    },
  },
  plugins: [],
} satisfies Config;
