# Guia de Migração: v1.x para v2.0

Este guia ajuda você a migrar seus workflows do n8n do node Magnet Customer v1.x para v2.0.

## Mudanças Incompatíveis

| Aspecto | v1.x | v2.0 |
|---------|------|------|
| Endpoints de criação | `/import/leads`, `/import/contacts`, etc. | `/leads`, `/contacts`, etc. |
| Rastreamento de origem | Header `api: 'n8n'` | Body `source: 'n8n'` |
| Suporte de plataforma | V1 + V2 | **Somente V2** |
| Deduplicação | Embutida (server-side) | No nível do workflow (veja abaixo) |

## O Que Você Precisa Fazer

### Se seus workflows apenas Criam contatos/leads

**Nenhuma alteração necessária.** O node gerencia o mapeamento de endpoints internamente. Basta atualizar a versão do node.

### Se seus workflows dependem de deduplicação

No v1.x, o endpoint `/import/leads` tinha **deduplicação embutida** — se um contato com o mesmo CPF/email já existisse, os dados seriam **mesclados** em vez de criar uma duplicata.

No v2.0, o endpoint `POST /leads` cria diretamente **sem deduplicação**. Para reproduzir o mesmo comportamento, você precisa adicionar uma etapa de busca antes de criar.

## Padrão de Deduplicação (Buscar → Ramificar → Criar ou Atualizar)

### Antes (v1.x) — Node único

```
[Trigger] → [Magnet Customer: Create Lead]
```

O node gerenciava a deduplicação internamente. Se um lead com o mesmo CPF existisse, ele era atualizado em vez de duplicado.

### Depois (v2.0) — Search + IF + Create/Update

```
[Trigger] → [Magnet Customer: Search Lead] → [IF] → [Create Lead] (não encontrado)
                                                  → [Update Lead] (encontrado)
```

### Configuração passo a passo

#### 1. Buscar contato existente

Adicione um node **Magnet Customer** com:
- **Resource:** Lead (ou Customer/Prospect)
- **Operation:** Search
- **Search:** Use o valor de CPF/doc do seu trigger: `{{ $json.doc }}`

#### 2. Verificar se o contato existe

Adicione um node **IF**:
- **Condition:** `{{ $json.length > 0 }}` é verdadeiro
  - Ou verifique: `{{ $('Search Lead').item.json.length }}` é maior que 0

#### 3a. Se NÃO encontrado → Criar

Adicione um node **Magnet Customer** com:
- **Resource:** Lead
- **Operation:** Create
- Preencha os campos com os dados do seu trigger

#### 3b. Se encontrado → Atualizar

Adicione um node **Magnet Customer** com:
- **Resource:** Lead
- **Operation:** Update
- **Lead ID:** `{{ $('Search Lead').first().json._id }}`
- Preencha os campos que deseja atualizar

### Exemplo completo de workflow

```
┌──────────┐    ┌─────────────────┐    ┌────┐    ┌─────────────────┐
│ Webhook  │───▶│ MC: Search Lead │───▶│ IF │───▶│ MC: Create Lead │ (não encontrado)
│ Trigger  │    │ search = doc    │    │    │    └─────────────────┘
└──────────┘    └─────────────────┘    │    │    ┌─────────────────┐
                                       │    │───▶│ MC: Update Lead │ (encontrado)
                                       └────┘    └─────────────────┘
```

### Dicas

- **Buscar por CPF/Doc:** Use o parâmetro `search` com o número do documento. A API pesquisa em `fullname`, `email`, `doc` e `phones`.
- **Buscar por email:** Se não tiver CPF, busque pelo endereço de email.
- **Workflows em lote:** Para importações em massa, adicione um node **Split In Batches** antes da busca para evitar limites de taxa.
- **Limites de taxa:** A API permite até 100 requisições por minuto por tenant. Adicione intervalos entre os lotes se necessário.

## Rastreamento de Origem

Contatos criados via n8n agora são rastreados com `source: 'n8n'` no CRM. Isso é automático — nenhuma configuração é necessária. Você pode filtrar contatos por origem na plataforma Magnet Customer.

## Perguntas Frequentes

### Preciso alterar meus workflows existentes?

Somente se eles dependem do comportamento de deduplicação. Se seus workflows apenas criam contatos sem se preocupar com duplicatas, eles continuarão funcionando normalmente após a atualização.

### Ainda posso usar o v1.x?

Sim, o v1.9.x continua disponível no npm. No entanto, ele não receberá atualizações e pode parar de funcionar conforme a infraestrutura V1 for descontinuada.

### O que acontece se eu criar uma duplicata?

O CRM criará um segundo contato com os mesmos dados. Você pode usar o recurso de **Mesclagem** na plataforma Magnet Customer para consolidar duplicatas manualmente, ou implementar o padrão de deduplicação descrito acima.

### Como verifico qual versão estou usando?

No n8n, vá em **Settings > Community Nodes**. A versão é exibida ao lado do nome do node.

## Suporte

- [Referência da API](https://apireference.magnetcustomer.com)
- [GitHub Issues](https://github.com/magnetcustomer/n8n-nodes-magnetcustomer/issues)
- Email: suporte@magnetcustomer.com
