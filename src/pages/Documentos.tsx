import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "sonner";
import { FileDown, Plus, Trash2, Calculator } from "lucide-react";
import {
  RecipientPicker,
  RecipientState,
  emptyRecipient,
  resolveRecipient,
  ResolvedRecipient,
} from "@/components/shared/RecipientPicker";
import { ReciboPDF } from "@/components/pdf/ReciboPDF";
import { FaturaPDF } from "@/components/pdf/FaturaPDF";
import { CotacaoPDF } from "@/components/pdf/CotacaoPDF";
import { PropostaPDF } from "@/components/pdf/PropostaPDF";
import { PlanoVendasPDF, PlanoVendasItem } from "@/components/pdf/PlanoVendasPDF";
import { FaturaParceladaPDF, Parcela } from "@/components/pdf/FaturaParceladaPDF";

interface DocumentosProps {
  isAdmin?: boolean;
}

const todayISO = () => new Date().toISOString().split("T")[0];
const fmtDate = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("pt-MZ") : "";

export default function Documentos({ isAdmin = false }: DocumentosProps) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [registeredClients, setRegisteredClients] = useState<any[]>([]);
  const [tab, setTab] = useState("recibo");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: empresaData } = await supabase
        .from("companies").select("*").eq("user_id", user.id).single();
      setEmpresa(empresaData);
      let q = supabase.from("clients").select("id, nome, telefone, email, endereco");
      if (!isAdmin) q = q.eq("user_id", user.id);
      const { data: cs } = await q.order("nome");
      setRegisteredClients(cs || []);
    })();
  }, [isAdmin]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Emissão de Documentos
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gere recibos, faturas, cotações e propostas para qualquer destinatário — cadastrado ou avulso.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap h-auto justify-start">
            <TabsTrigger value="recibo">Recibo</TabsTrigger>
            <TabsTrigger value="fatura">Fatura</TabsTrigger>
            <TabsTrigger value="cotacao">Cotação</TabsTrigger>
            <TabsTrigger value="proposta">Proposta</TabsTrigger>
            <TabsTrigger value="plano">Plano de Vendas</TabsTrigger>
            <TabsTrigger value="parcelada">Fatura Parcelada</TabsTrigger>
          </TabsList>

          <TabsContent value="recibo">
            <SingleServiceForm
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
              docType="recibo"
            />
          </TabsContent>
          <TabsContent value="fatura">
            <SingleServiceForm
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
              docType="fatura"
            />
          </TabsContent>
          <TabsContent value="cotacao">
            <SingleServiceForm
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
              docType="cotacao"
            />
          </TabsContent>
          <TabsContent value="proposta">
            <SingleServiceForm
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
              docType="proposta"
            />
          </TabsContent>
          <TabsContent value="plano">
            <PlanoVendasFormUI
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
            />
          </TabsContent>
          <TabsContent value="parcelada">
            <FaturaParceladaFormUI
              isAdmin={isAdmin}
              empresa={empresa}
              registeredClients={registeredClients}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/* ============================================================
 * Single-service-based docs (Recibo / Fatura / Cotação / Proposta)
 * ============================================================ */
type DocType = "recibo" | "fatura" | "cotacao" | "proposta";

const DOC_LABEL: Record<DocType, string> = {
  recibo: "Recibo",
  fatura: "Fatura",
  cotacao: "Cotação",
  proposta: "Proposta",
};

interface BaseProps {
  isAdmin: boolean;
  empresa: any;
  registeredClients: any[];
}

function SingleServiceForm({
  isAdmin, empresa, registeredClients, docType,
}: BaseProps & { docType: DocType }) {
  const [recipient, setRecipient] = useState<RecipientState>(emptyRecipient());
  const [nomeServico, setNomeServico] = useState("");
  const [dataServico, setDataServico] = useState(todayISO());
  const [valorTotal, setValorTotal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [statusPagamento, setStatusPagamento] = useState<"pago" | "pendente" | "devendo">(
    docType === "recibo" ? "pago" : "pendente"
  );
  const [resolved, setResolved] = useState<ResolvedRecipient | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset preview if any input changes
  const invalidate = () => setResolved(null);

  async function handlePrepare() {
    try {
      setLoading(true);
      if (!nomeServico.trim()) throw new Error("Descrição do serviço é obrigatória");
      if (!valorTotal || parseFloat(valorTotal) <= 0) throw new Error("Valor total inválido");

      const reg = registeredClients.find((c) => c.id === recipient.clientId);
      const r = await resolveRecipient(recipient, reg);
      setResolved(r);
      toast.success(`${DOC_LABEL[docType]} pronto — clique em "Descarregar PDF"`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao preparar documento");
    } finally {
      setLoading(false);
    }
  }

  const servico = resolved
    ? {
        id: "doc-" + Date.now(),
        nome_servico: nomeServico,
        data_servico: dataServico,
        valor_total: parseFloat(valorTotal) || 0,
        valor_investimento: 0,
        valor_lucro: parseFloat(valorTotal) || 0,
        status_pagamento: statusPagamento,
        tipo_pagamento: "fixo",
        observacoes,
        client_id: resolved.client_id || "",
        detalhes_servico: { categoria: "outro" },
      }
    : null;

  const pdfDoc = servico && resolved
    ? docType === "recibo"
      ? <ReciboPDF servico={servico} cliente={resolved} empresa={empresa} />
      : docType === "fatura"
      ? <FaturaPDF servico={servico} cliente={resolved} empresa={empresa} />
      : docType === "cotacao"
      ? <CotacaoPDF servico={servico} cliente={resolved} empresa={empresa} />
      : <PropostaPDF servico={servico} cliente={resolved} empresa={empresa} />
    : null;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <RecipientPicker
          value={recipient}
          onChange={(v) => { setRecipient(v); invalidate(); }}
          isAdmin={isAdmin}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Descrição do serviço *</Label>
            <Input
              value={nomeServico}
              maxLength={150}
              onChange={(e) => { setNomeServico(e.target.value); invalidate(); }}
              placeholder="Ex: Criação de Website Institucional"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Data *</Label>
            <Input
              type="date"
              value={dataServico}
              onChange={(e) => { setDataServico(e.target.value); invalidate(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Valor Total (MT) *</Label>
            <Input
              type="number" step="0.01"
              value={valorTotal}
              onChange={(e) => { setValorTotal(e.target.value); invalidate(); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status de pagamento</Label>
            <Select value={statusPagamento} onValueChange={(v) => { setStatusPagamento(v as any); invalidate(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="devendo">Devendo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea
            rows={3}
            maxLength={1000}
            value={observacoes}
            onChange={(e) => { setObservacoes(e.target.value); invalidate(); }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
          {!resolved ? (
            <Button onClick={handlePrepare} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Preparando..." : `Preparar ${DOC_LABEL[docType]}`}
            </Button>
          ) : (
            <>
              <PDFDownloadLink
                document={pdfDoc!}
                fileName={`${docType}-${(resolved.nome || "doc").replace(/\s+/g, "-")}-${Date.now()}.pdf`}
                className="inline-flex"
              >
                {({ loading: l }) => (
                  <Button disabled={l} className="w-full sm:w-auto">
                    <FileDown className="w-4 h-4 mr-2" />
                    {l ? "Gerando..." : `Descarregar ${DOC_LABEL[docType]} PDF`}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button variant="outline" onClick={() => setResolved(null)} className="w-full sm:w-auto">
                Editar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
 * Plano de Vendas
 * ============================================================ */
function PlanoVendasFormUI({ isAdmin, empresa, registeredClients }: BaseProps) {
  const [recipient, setRecipient] = useState<RecipientState>(emptyRecipient());
  const [numero, setNumero] = useState(`PV-${Date.now().toString().slice(-6)}`);
  const [data, setData] = useState(todayISO());
  const [validade, setValidade] = useState("");
  const [itens, setItens] = useState<PlanoVendasItem[]>([{ descricao: "", qtd: 1, preco: 0 }]);
  const [observacoes, setObservacoes] = useState("");
  const [resolved, setResolved] = useState<ResolvedRecipient | null>(null);

  const total = itens.reduce((s, i) => s + i.qtd * i.preco, 0);

  const updateItem = (idx: number, patch: Partial<PlanoVendasItem>) => {
    setResolved(null);
    setItens((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  async function handlePrepare() {
    try {
      if (itens.length === 0 || itens.some((i) => !i.descricao.trim() || i.qtd <= 0)) {
        throw new Error("Preencha todos os itens com descrição e quantidade válida");
      }
      const reg = registeredClients.find((c) => c.id === recipient.clientId);
      const r = await resolveRecipient(recipient, reg);
      setResolved(r);
      toast.success("Plano pronto — clique em Descarregar PDF");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <RecipientPicker
          value={recipient}
          onChange={(v) => { setRecipient(v); setResolved(null); }}
          isAdmin={isAdmin}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Nº do Plano</Label>
            <Input value={numero} onChange={(e) => { setNumero(e.target.value); setResolved(null); }} />
          </div>
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => { setData(e.target.value); setResolved(null); }} />
          </div>
          <div className="space-y-1.5">
            <Label>Válido até</Label>
            <Input type="date" value={validade} onChange={(e) => { setValidade(e.target.value); setResolved(null); }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Itens do plano *</Label>
            <Button
              type="button" size="sm" variant="outline"
              onClick={() => { setItens((a) => [...a, { descricao: "", qtd: 1, preco: 0 }]); setResolved(null); }}
            >
              <Plus className="w-4 h-4 mr-1" /> Item
            </Button>
          </div>
          <div className="space-y-2">
            {itens.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-md">
                <div className="col-span-12 sm:col-span-6 space-y-1">
                  <Label className="text-xs">Descrição</Label>
                  <Input
                    value={it.descricao}
                    onChange={(e) => updateItem(idx, { descricao: e.target.value })}
                    placeholder="Ex: Criação de Logotipo"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 space-y-1">
                  <Label className="text-xs">Qtd</Label>
                  <Input
                    type="number" min={1}
                    value={it.qtd}
                    onChange={(e) => updateItem(idx, { qtd: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-6 sm:col-span-3 space-y-1">
                  <Label className="text-xs">Preço Unit. (MT)</Label>
                  <Input
                    type="number" step="0.01"
                    value={it.preco}
                    onChange={(e) => updateItem(idx, { preco: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 flex justify-end">
                  <Button
                    type="button" size="icon" variant="ghost"
                    onClick={() => { setItens((a) => a.filter((_, i) => i !== idx)); setResolved(null); }}
                    disabled={itens.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-right text-sm">
            <span className="text-muted-foreground">Total:</span>{" "}
            <span className="font-bold text-lg">{total.toFixed(2)} MT</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea rows={3} maxLength={1000} value={observacoes} onChange={(e) => { setObservacoes(e.target.value); setResolved(null); }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
          {!resolved ? (
            <Button onClick={handlePrepare} className="w-full sm:w-auto">Preparar Plano</Button>
          ) : (
            <>
              <PDFDownloadLink
                document={
                  <PlanoVendasPDF
                    numero={numero}
                    data={fmtDate(data)}
                    validade={validade ? fmtDate(validade) : undefined}
                    cliente={resolved}
                    empresa={empresa}
                    itens={itens}
                    observacoes={observacoes || undefined}
                  />
                }
                fileName={`plano-vendas-${(resolved.nome || "doc").replace(/\s+/g, "-")}-${Date.now()}.pdf`}
              >
                {({ loading: l }) => (
                  <Button disabled={l} className="w-full sm:w-auto">
                    <FileDown className="w-4 h-4 mr-2" />
                    {l ? "Gerando..." : "Descarregar Plano PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button variant="outline" onClick={() => setResolved(null)}>Editar</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
 * Fatura Parcelada
 * ============================================================ */
function FaturaParceladaFormUI({ isAdmin, empresa, registeredClients }: BaseProps) {
  const [recipient, setRecipient] = useState<RecipientState>(emptyRecipient());
  const [numero, setNumero] = useState(`FP-${Date.now().toString().slice(-6)}`);
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [numParcelas, setNumParcelas] = useState("3");
  const [dataPrimeira, setDataPrimeira] = useState(todayISO());
  const [intervalo, setIntervalo] = useState<"mensal" | "quinzenal">("mensal");
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [resolved, setResolved] = useState<ResolvedRecipient | null>(null);

  function gerarParcelas() {
    const v = parseFloat(valorTotal) || 0;
    const n = parseInt(numParcelas) || 0;
    if (v <= 0 || n <= 0) {
      toast.error("Valor total e número de parcelas inválidos");
      return;
    }
    const base = Math.floor((v / n) * 100) / 100;
    const sobra = +(v - base * n).toFixed(2);

    const baseDate = new Date(dataPrimeira + "T00:00:00");
    const arr: Parcela[] = [];
    for (let i = 0; i < n; i++) {
      const d = new Date(baseDate);
      if (intervalo === "mensal") d.setMonth(d.getMonth() + i);
      else d.setDate(d.getDate() + 15 * i);
      arr.push({
        numero: i + 1,
        data: d.toLocaleDateString("pt-MZ"),
        valor: i === n - 1 ? +(base + sobra).toFixed(2) : base,
        status: "pendente",
      });
    }
    setParcelas(arr);
    setResolved(null);
    toast.success("Parcelas geradas — confira abaixo");
  }

  async function handlePrepare() {
    try {
      if (!descricao.trim()) throw new Error("Descrição é obrigatória");
      if (parcelas.length === 0) throw new Error('Clique em "Gerar Parcelas" primeiro');
      const reg = registeredClients.find((c) => c.id === recipient.clientId);
      const r = await resolveRecipient(recipient, reg);
      setResolved(r);
      toast.success("Fatura pronta — clique em Descarregar PDF");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <RecipientPicker
          value={recipient}
          onChange={(v) => { setRecipient(v); setResolved(null); }}
          isAdmin={isAdmin}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nº da Fatura</Label>
            <Input value={numero} onChange={(e) => setNumero(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Data de Emissão</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Descrição do serviço/produto *</Label>
          <Textarea
            rows={2} maxLength={400}
            value={descricao}
            onChange={(e) => { setDescricao(e.target.value); setResolved(null); }}
            placeholder="Ex: Desenvolvimento de sistema interno de gestão"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Valor Total (MT) *</Label>
            <Input
              type="number" step="0.01"
              value={valorTotal}
              onChange={(e) => { setValorTotal(e.target.value); setParcelas([]); setResolved(null); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nº Parcelas *</Label>
            <Input
              type="number" min={1} max={36}
              value={numParcelas}
              onChange={(e) => { setNumParcelas(e.target.value); setParcelas([]); setResolved(null); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>1ª Parcela em</Label>
            <Input
              type="date" value={dataPrimeira}
              onChange={(e) => { setDataPrimeira(e.target.value); setParcelas([]); setResolved(null); }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Intervalo</Label>
            <Select value={intervalo} onValueChange={(v) => { setIntervalo(v as any); setParcelas([]); setResolved(null); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={gerarParcelas} className="w-full sm:w-auto">
          <Calculator className="w-4 h-4 mr-2" /> Gerar Parcelas
        </Button>

        {parcelas.length > 0 && (
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Parcela</th>
                  <th className="px-3 py-2 text-left">Vencimento</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {parcelas.map((p) => (
                  <tr key={p.numero} className="border-t">
                    <td className="px-3 py-2">{p.numero}/{parcelas.length}</td>
                    <td className="px-3 py-2">{p.data}</td>
                    <td className="px-3 py-2 text-right font-medium">{p.valor.toFixed(2)} MT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Observações</Label>
          <Textarea rows={3} maxLength={1000} value={observacoes} onChange={(e) => { setObservacoes(e.target.value); setResolved(null); }} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
          {!resolved ? (
            <Button onClick={handlePrepare} className="w-full sm:w-auto">Preparar Fatura</Button>
          ) : (
            <>
              <PDFDownloadLink
                document={
                  <FaturaParceladaPDF
                    numero={numero}
                    data={fmtDate(data)}
                    cliente={resolved}
                    empresa={empresa}
                    descricao={descricao}
                    valorTotal={parseFloat(valorTotal) || 0}
                    parcelas={parcelas}
                    observacoes={observacoes || undefined}
                  />
                }
                fileName={`fatura-parcelada-${(resolved.nome || "doc").replace(/\s+/g, "-")}-${Date.now()}.pdf`}
              >
                {({ loading: l }) => (
                  <Button disabled={l} className="w-full sm:w-auto">
                    <FileDown className="w-4 h-4 mr-2" />
                    {l ? "Gerando..." : "Descarregar Fatura Parcelada PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button variant="outline" onClick={() => setResolved(null)}>Editar</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
