

## Plan: Fix PDF Client Data & Add Service-Type-Specific Form

### Problem Summary
1. PDFs show "N/A" for client phone/email because the query only fetches `clients (nome)` -- missing all other client fields
2. The service form is generic and doesn't support service-type-specific fields (domain, hosting, etc.)
3. Need predefined service categories with conditional fields

### Changes

#### 1. Fix Client Data in PDFs
**File: `src/pages/Servicos.tsx`**
- Change the services query from `clients (nome)` to `clients (nome, telefone, email, endereco)` so all client fields are available in PDFs
- Update the `Service` interface to include the full client fields

#### 2. Add Service Categories with Specific Fields
**File: `src/components/services/ServiceForm.tsx`**
- Add a "Categoria do Servico" dropdown with predefined options:
  - Criacao de Website
  - Criacao de Aplicativo
  - Criacao de Sistema
  - Gestao de Trafego Pago
  - Gestao de Redes Sociais
  - Outro (custom text input)
- When "Criacao de Website" is selected, show extra fields:
  - Valor do Dominio (MT)
  - Valor da Hospedagem (MT)
  - Hospedagem Gratuita? (switch) + Periodo de hospedagem gratuita (months)
- When "Gestao de Trafego Pago" is selected:
  - Orcamento de Anuncios (MT)
  - Plataformas (Facebook, Google, Instagram, etc.)
- When "Outro" is selected:
  - Campo de texto livre para nome do servico

#### 3. Database Migration
Add a JSON column `detalhes_servico` to the `services` table to store service-type-specific data (domain cost, hosting cost, free hosting period, platforms, etc.) without needing separate tables for each service type.

```sql
ALTER TABLE services ADD COLUMN detalhes_servico jsonb DEFAULT '{}';
```

#### 4. Update PDFs to Show Service-Specific Details
**Files: `ReciboPDF.tsx`, `CotacaoPDF.tsx`, `PropostaPDF.tsx`**
- Parse `detalhes_servico` JSON and render relevant fields based on service category
- For website services: show domain, hosting, free hosting period
- For traffic management: show ad budget, platforms
- Use the company's uploaded logo (already supported via `empresa.logotipo_url`)

### Technical Details

- The `detalhes_servico` JSONB column allows flexible storage per service type without schema changes for each new service
- Service categories are defined as constants in the form component
- The "Outro" option allows free text entry for unlisted services
- Client data fix is a one-line query change that immediately fixes all PDF documents
- The logo already works via the "Minha Empresa" page upload -- no changes needed there

