# SmartDeal: andamento do projeto

Última atualização: 24/11/2026

## Concluído
- Contas gratuitas criadas: GitHub, Supabase e Vercel.
- Base do app (React, Vite e Tailwind) publicada na Vercel.
- Fase 1: menu de navegação com as 10 seções e dashboard inicial, sem dados inventados.
- Fase 2: Buscar Ofertas (links de busca em 9 lojas), Lista de Desejos com preços registrados à mão, menor preço, gráfico e aviso de meta atingida, cadastro e login (Supabase) e sincronização da lista com a conta.

## Em andamento
- Fase 3: cupons.

## Próximos passos
1. Fase 3: cupons com status "válido", "não verificado" e "expirado", e cálculo do preço final.
2. Fase 4: PC Builder e motor de compatibilidade.
3. Fase 5: simulador de FPS, Streaming Analyzer e comparador.
4. Fase 6: atualização automática, testes e finalização.

## Observações técnicas
- Ao criar tabelas no Supabase, além do RLS é preciso liberar as permissões (grant) para o papel "authenticated". Sem isso aparece "permission denied".
