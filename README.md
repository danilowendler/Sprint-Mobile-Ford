# Ford Intelligence — Sprint Mobile Development & IoT

• Italo Caliari Silva - RM554758 

• Júlio César Ruiz Zequin - RM554676 
• Danilo Gronski Wendler - RM 556602 
• Pedro Henrique Muzel Santos - RM 555983 
• Vitor Montemor Ismael - RM 556027 

Aplicativo mobile multiplataforma (iOS/Android) de fidelização do pós-venda Ford, desenvolvido em **React Native + Expo**. Solução para o **Desafio 2 — Retenção e fidelização de clientes no pós-venda**.

O app combina IA preditiva de manutenção (mock), telemetria IoT simulada (OBD2), visualização 3D do veículo, agendamento "leva e traz" e carteira de cashback. Segmentado em três planos SaaS: **Agro**, **Urban** e **Premium**.

> Escopo: **Frontend Mobile only**. Backend, ML e automações ficam fora do escopo da Sprint — interfaces externas são mockadas localmente com latência realista (200–800 ms).

---

## Contexto da Sprint

Entrega da disciplina **Mobile Development and IoT**. Cada equipe desenvolveu uma solução mobile com React Native + Expo que responde a um dos desafios propostos pela Ford, consumindo ao menos uma fonte de dados externa via API.

A solução demonstra domínio dos conceitos trabalhados em aula:

- Componentes React Native customizados e reutilizáveis
- Gerenciamento de estado global com **Zustand** + hidratação no boot
- Navegação **file-based com Expo Router** (stacks, tabs, rotas dinâmicas)
- Consumo de **APIs assíncronas** (mocks com delays 200–800 ms simulando rede real)
- **Armazenamento local** persistido (`AsyncStorage` para perfil/agendamentos, `SecureStore` para token)
- **Integração com recursos do dispositivo**: haptics (`expo-haptics`), simulador OBD2 via `EventEmitter`, gestos (`react-native-gesture-handler`), GL nativo (`expo-gl` para 3D)

## Como o app resolve o Desafio 2

| Necessidade do pós-venda | Como o app atende |
|---|---|
| **Reduzir atrito no agendamento** | Mapa de concessionárias + fluxo de 5 passos com modalidade "leva e traz"; Premium tem "Agendar em 1 toque" via Assistente |
| **Antecipar manutenção** | Card de IA preditiva na Home com estimativa de próxima revisão (data + confiança) |
| **Engajar com telemetria** | Simulador OBD2 (hodômetro, pneus, motor, combustível, bateria) emitindo a cada 2 s; KPIs animados; alertas em tempo real |
| **Visualização do veículo** | Cena 3D interativa (Three.js + R3F) com hotspots de alerta sincronizados com a telemetria |
| **Recompensa por fidelidade** | Carteira de cashback com extrato, cupons geolocalizados e resgate em postos |
| **Diferenciação por plano** | Tema reativo (Agro/Urban/Premium) — cores, alertas extras (terrain), rota inteligente, atalhos exclusivos |

## Stack

- **React Native + Expo** (managed workflow, SDK 54)
- **Expo Router** (file-based routing) com lazy loading via `React.lazy + Suspense` em cenas pesadas
- **TypeScript** strict
- **Zustand** (estado global com hidratação em `app/_layout.tsx`)
- **three.js** + `@react-three/fiber/native` + `expo-gl` (visualização 3D)
- `react-native-maps` (mapa de concessionárias, com web stub via Metro resolver)
- `react-native-reanimated`, `expo-blur`, `expo-haptics`
- `react-hook-form` + `zod` (formulários e validação)

## Pré-requisitos

- **Node.js 20+** (testado em 24.x)
- **npm 10+**
- **Expo Go** (iOS/Android) ou simulador/emulador
- macOS + Xcode (para iOS) ou Android Studio (para Android)

## Quickstart

```bash
git clone <URL-DESTE-REPO>
cd Ford-Intelligence-Entrega
npm install
npm run start          # abre Metro; escolha a plataforma no terminal
```

Não há `.env` necessário: todos os "endpoints" são mocks locais em `src/services/mocks/`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run start` | Inicia o Expo dev server (Metro) |
| `npm run android` | Build dev + abre Android |
| `npm run ios` | Build dev + abre iOS (macOS) |
| `npm run web` | Versão web (debug rápido; mapa usa stub) |
| `npm run lint` | ESLint (`expo lint`) |
| `npm run format` | Prettier write |
| `npm run typecheck` | `tsc --noEmit` |

## Estrutura

```
app/         # rotas Expo Router (file-based: (auth), (tabs), (analyst), scheduling/, vehicle/, wallet/)
src/
  components/  # UI compartilhada (Button, Card, GlassPanel, Skeleton, EmptyState, ErrorState…)
  features/    # módulos por domínio (telemetry, vehicle3d, scheduling, cashback, plan-gates, analyst-dashboard)
  stores/      # Zustand stores (auth, user, plan, vehicle, alerts, scheduling, wallet, analyst)
  services/    # api/mocks (delays 200–800 ms, sem network real)
  hooks/       # useProtectedRoute (role-gate cliente vs analyst)
  theme/       # tokens, plans (Agro/Urban/Premium), typography, ThemeProvider
  utils/       # haptics, distance, date helpers
scripts/     # generate-icons.js (assets PNG Ford-blue placeholder)
assets/      # fonts, imagens (icon, splash, adaptive)
```

## Personas e como alternar

- **Cliente Final**: fluxo padrão (login → onboarding → tabs Home/Mapa/Carteira/Perfil). Plano (Agro/Urban/Premium) é trocável em **Perfil → Trocar plano**, alterando acentos visuais e features condicionais (ex.: "Agendar em 1 toque" e Assistente Premium).
- **Analista Ford**: na tela de login, ative o toggle **"Sou analista Ford"** antes de entrar. Direciona para `(analyst)/dashboard` com KPIs, gráfico de barras e leads qualificados pela IA.

## Smoke test pós-build (12 itens)

| # | Cenário | Esperado |
|---|---|---|
| 1 | `npm run start` em projeto limpo | Splash Ford-blue → Home com Inter carregada |
| 2 | Cold start na Home | Telemetria começa em ≤ 2 s; primeiro KPI aparece |
| 3 | Tab Mapa (primeiro acesso) | `MapSkeleton` rápido → `MapView` com 10 pins; promo badges visíveis |
| 4 | Tocar pin → Agendar | Bottom sheet glass → fluxo 5 steps → tela de sucesso com haptic |
| 5 | Cancelar agendamento (Perfil) | Alert nativo → status "Cancelado" + haptic Medium |
| 6 | Tab Carteira | Saldo animado, extrato com transações, cupons grid |
| 7 | Resgatar cupom | Modal de posto → confirmação com haptic Success |
| 8 | Detalhe 3D do veículo | Skeleton → cena 3D com hotspots tocáveis (haptic selection) |
| 9 | Trocar plano (Perfil) | Flash de transição → acentos atualizam em todas as telas |
| 10 | Login analyst | Toggle ativo → dashboard com KPIs + barras animadas |
| 11 | Filtros analyst | Trocar período/plano → gráfico de barras reanima sem race |
| 12 | Font scaling 200 % | KPIs e headings respeitam clamp; glass cards não estouram |

## Troubleshooting

**Reanimated worklets falhando**: SDK 54 usa Reanimated 4 com `react-native-worklets@0.5.x` (já configurado). Não é necessário `babel.config.js` para o plugin antigo. Se erros do tipo "worklet not found" aparecerem, rode `npm run start -- --clear`.

**Mapa em branco no web**: `react-native-maps` é nativo. Web usa stub via Metro resolver (`metro.config.js`) e a tela de fallback `app/(tabs)/map.web.tsx`. Comportamento esperado.

**Fontes não carregam (Inter)**: a app espera `fontsLoaded || fontError` antes de renderizar. Se travar, verifique conexão (Google Fonts é baixado em runtime via `@expo-google-fonts/inter`).

**Splash travado em produção**: `expo-splash-screen` é escondido em efeito após `ready` (`fontsLoaded && hydrated`). Em ambientes lentos, esperar até 3 s antes de assumir bug.

**Trocar entre cliente e analyst**: o role-gate em `useProtectedRoute.ts` é estrito; analyst não acessa `(tabs)`. Faça logout (`Perfil → Sair`) antes de alternar.

**Regenerar ícones placeholder**: `node scripts/generate-icons.js` (sem dependências externas — usa `pngjs` transitiva).

## Status do projeto

Aplicação **feature-complete** para os critérios da Sprint:

- ✅ Auth mock + onboarding multi-step
- ✅ Home com telemetria IoT simulada + alertas preditivos
- ✅ Visualização 3D do veículo com hotspots interativos
- ✅ Mapa de concessionárias + fluxo "leva e traz"
- ✅ Carteira de cashback (saldo, extrato, cupons)
- ✅ Diferenciação visual e funcional por plano SaaS
- ✅ Dashboard interno do Analista Ford (mock)
- ✅ Polimento de acessibilidade, performance, haptics e assets
