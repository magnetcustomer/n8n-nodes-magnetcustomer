# n8n — Próximos Passos

## Status Atual
- **npm:** @magnetcustomer/n8n-nodes-magnetcustomer@2.1.1 publicado
- **Produção:** Instalado no n8n pod (eks-enterprise-1, namespace n8n)
- **ZD-613:** Respondido com instruções de atualização

## Pendente

### 1. Atualizar n8n pod para v2.1.1 (se necessário)
```bash
kubectl exec -n n8n <pod> --context eks-enterprise-1 -- \
  sh -c 'cd /home/node/.n8n/nodes && npm install @magnetcustomer/n8n-nodes-magnetcustomer@latest'
# Reiniciar pod para carregar
kubectl delete pod -n n8n <pod> --context eks-enterprise-1
```

### 2. Monitorar erros de instalação
- Verificar se clientes reportam erro de `ast-types/main.js` (fix aplicado na v2.0.1+)
- Se reportado: instruir a reinstalar o pacote no n8n

### 3. Endpoints verificados (bugs corrigidos)
- V1 `/api/import/*` → V2 `/api/leads`, `/api/prospects`, `/api/contacts`
- `NodeConnectionType` → `NodeConnectionTypes` (n8n-workflow v1.62+)
- TypeScript 4.8 → 5.6 (compatibilidade com Zod v4)
- `peerDependencies` removidas (evita nested node_modules)

## Segurança
- **REVOGAR** npm token usado na sessão (verificar SSM `/magnetcustomer/npm/automation-token`)
- Rotacionar token via npmjs.com → Access Tokens
