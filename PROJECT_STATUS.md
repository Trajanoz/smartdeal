# SmartDeal: andamento do projeto

Última atualização: 24/11/2026

## Concluído
- Contas gratuitas criadas: GitHub, Supabase e Vercel.
- Base do app (React, Vite e Tailwind) publicada na Vercel.
- Fase 1: menu de navegação com as 10 seções e dashboard inicial, sem dados inventados.
- Fase 2: Buscar Ofertas (links de busca em 9 lojas), Lista de Desejos com preços registrados à mão, cadastro e login (Supabase) e sincronização da lista com a conta.
- Fase 3: Cupons com status "válido", "não verificado" e "expirado", cálculo do preço final e dados na conta.
- Fase 4 (parte 1): PC Builder com catálogo inicial e motor de compatibilidade (socket, BIOS, memória, vídeo, fonte, cooler, gabinete e armazenamento).
- Fase 4 (parte 2): PCs Recomendados em 7 faixas, com orçamento e ordenação por preço informado pelo usuário.

## Em andamento
- Fase 4: salvar várias montagens na conta (editar e duplicar).

## Próximos passos
1. Fase 4: montagens salvas na conta do Supabase.
2. Fase 5: simulador de FPS, Streaming Analyzer e comparador de hardware.
3. Fase 6: atualização automática, testes, otimização para celular e finalização.

## Observações técnicas
- Ao criar tabelas no Supabase, além do RLS é preciso liberar as permissões (grant) para o papel "authenticated". Sem isso aparece "permission denied".
- O catálogo do PC Builder usa processadores e placas de vídeo reais e categorias para as demais peças. Onde falta dado (comprimento da placa de vídeo, slots M.2), o motor mostra "informação insuficiente".
