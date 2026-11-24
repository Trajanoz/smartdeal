# SmartDeal: status das integrações

Última atualização: 24/11/2026

## Busca nas lojas (links de pesquisa)
Cada loja abre a própria página de busca com o termo digitado. Não há extração de dados nem preços nesta etapa.

| Loja | Situação |
|---|---|
| KaBuM! | Funcionando |
| TerabyteShop | Funcionando |
| Magazine Luiza | Funcionando |
| Pichau | Funcionando (testado pelo usuário) |
| Amazon Brasil | Funcionando (testado pelo usuário) |
| Mercado Livre | Funcionando (testado pelo usuário) |
| Shopee | Funcionando (testado pelo usuário) |
| AliExpress | Funcionando (testado pelo usuário) |
| Casas Bahia | Limitação: o endereço de busca direto deu erro. Usa busca no Google restrita ao site da loja. Pode ser trocado quando houver um endereço de busca confirmado. |

## Demais integrações

| Integração | Situação | Observações |
|---|---|---|
| Supabase: login (e-mail e senha) | Funcionando | Cadastro com confirmação por e-mail. O plano gratuito limita o envio de e-mails. |
| Supabase: lista de desejos | Funcionando | Sincronizada com a conta, com proteção RLS. Sem login, fica salva no navegador. |
| Preços das lojas | Pendente | Preços são registrados à mão pelo usuário. Integrações automáticas só quando permitidas pelas lojas e gratuitas. |
| Cupons | Em andamento | Sem verificação automática gratuita. Cupons ficam "não verificado" até o usuário confirmar. |
| Benchmarks de FPS | Pendente | Somente dados reais registrados. Sem dados, o app informará "dados insuficientes". |
| Atualização programada | Pendente | Será feita com GitHub Actions, de forma periódica e não em tempo real. |
