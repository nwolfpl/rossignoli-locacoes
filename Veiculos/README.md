# Rossignoli Veículos — protótipo do site de estoque

Protótipo funcional de um site de venda de carros seminovos e usados.
Esta primeira versão cobre o essencial: **vitrine de estoque, busca com filtros e
página do anúncio com contato direto pelo WhatsApp**.

> Todos os veículos, preços e contatos são **fictícios**, criados apenas para demonstração.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para gerar a versão de produção: `npm run build && npm start`.

## O que já funciona

- **Home** — busca principal (texto + marca + preço), marcas do estoque, destaques,
  atalhos por categoria e explicação de como funciona a compra.
- **Estoque (`/carros`)** — filtros combináveis por marca, carroceria, câmbio, combustível,
  faixa de preço, ano e quilometragem, além de busca por texto e 5 critérios de ordenação.
  Os filtros vivem na URL, então qualquer busca pode ser compartilhada por link.
  Em telas pequenas os filtros abrem em painel inferior.
- **Anúncio (`/anuncio/[slug]`)** — galeria com 4 ângulos, ficha técnica completa,
  lista de equipamentos, dicas de segurança, veículos parecidos, CTA fixo no mobile,
  contato por WhatsApp e formulário de interesse (envio simulado).
- **Estados de vazio e 404** — busca sem resultado oferece limpar os filtros.
- **SEO básico** — títulos e descrições por página, URLs amigáveis, HTML semântico
  e pré-renderização estática de todos os anúncios.

## Arquitetura

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

```
src/
  app/                 rotas (home, /carros, /anuncio/[slug], 404)
  components/          UI reutilizável (card, galeria, filtros, header, footer…)
  data/vehicles.ts     estoque fictício (16 veículos)
  domain/types.ts      tipos do domínio (Vehicle, VehicleQuery, ordenação)
  lib/                 funções puras: formatação, filtros, config da loja
  services/            repositório de veículos (contrato + implementação mock)
```

Decisões que importam para a evolução:

1. **A UI nunca acessa os dados diretamente.** Tudo passa por
   `vehicleRepository` (`src/services/vehicleRepository.ts`), que hoje lê um array
   em memória. Trocar por uma API real significa reimplementar essa interface —
   nenhum componente muda.
2. **Filtros são estado de URL**, não estado interno. Isso dá links compartilháveis,
   botão voltar funcionando e abre caminho para renderização no servidor depois.
3. **Regras de negócio ficam em funções puras** (`src/lib/filters.ts`), fáceis de testar
   e de mover para o backend quando ele existir.
4. **Sem fotos de terceiros.** Cada anúncio recebe uma ilustração vetorial gerada em
   código a partir da carroceria e da cor (`VehiclePhoto`), o que evita problemas de
   licença no protótipo. Quando houver fotos reais, basta trocar esse componente.

## Antes de colocar no ar

- Substituir os contatos placeholder em `src/lib/site.ts` (WhatsApp, telefone, e-mail, endereço).
- Substituir o estoque fictício de `src/data/vehicles.ts` pelos veículos reais e por fotos.
- Definir o domínio em `SITE.url` (usado nos metadados).

## Próximos passos possíveis

- Favoritos e comparação de veículos
- Simulador de financiamento (ilustrativo)
- Área do vendedor: publicar anúncio e acompanhar visualizações/contatos
- Registro real dos leads do formulário (hoje o envio é simulado)
- Backend + painel de administração do estoque

## Limitações do protótipo

- Não há backend, banco de dados nem autenticação.
- O formulário de interesse não envia nada; o canal real é o link do WhatsApp.
- As imagens são ilustrações vetoriais, não fotos dos veículos.
- Os selos ("Preço abaixo da média", "Baixa quilometragem") são calculados apenas
  sobre os 16 veículos fictícios do próprio protótipo — não há análise de mercado real.
