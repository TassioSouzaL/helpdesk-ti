import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tokens de status/SLA usados no protótipo — mantenha consistência com a UI validada.
        status: {
          aberto: '#3567C7',
          atendimento: '#B4740A',
          aguardando: '#6E5BD6',
          resolvido: '#1F8F5F',
          fechado: '#7A8496',
        },
        sla: {
          ok: '#1F8F5F',
          atencao: '#B4740A',
          alerta: '#C6570F',
          critico: '#C4372E',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
