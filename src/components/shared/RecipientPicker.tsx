import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, UserPlus } from "lucide-react";

export interface ManualRecipient {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  nuit?: string;
}

export interface RecipientState {
  mode: "registered" | "manual";
  clientId?: string;
  manual: ManualRecipient;
  saveToBase: boolean;
}

export const emptyRecipient = (): RecipientState => ({
  mode: "registered",
  clientId: "",
  manual: { nome: "", telefone: "", email: "", endereco: "", nuit: "" },
  saveToBase: false,
});

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
}

interface RecipientPickerProps {
  value: RecipientState;
  onChange: (v: RecipientState) => void;
  isAdmin?: boolean;
  /** When true, manual mode forces saveToBase (used when caller MUST have a client_id). */
  requireSaveOnManual?: boolean;
  /** Hide the "save to base" checkbox (e.g., when emitting a one-off doc only). */
  hideSaveOption?: boolean;
}

export function RecipientPicker({
  value,
  onChange,
  isAdmin = false,
  requireSaveOnManual = false,
  hideSaveOption = false,
}: RecipientPickerProps) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        let q = supabase
          .from("clients")
          .select("id, nome, telefone, email, endereco")
          .order("nome");
        if (!isAdmin) q = q.eq("user_id", user.id);
        const { data } = await q;
        setClients(data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isAdmin]);

  const setMode = (mode: "registered" | "manual") => {
    onChange({ ...value, mode, saveToBase: mode === "manual" && requireSaveOnManual ? true : value.saveToBase });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
      <Label className="text-sm font-semibold">Destinatário do documento *</Label>
      <Tabs value={value.mode} onValueChange={(v) => setMode(v as "registered" | "manual")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registered" className="gap-2">
            <UserCheck className="h-4 w-4" /> Cliente cadastrado
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <UserPlus className="h-4 w-4" /> Cliente avulso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registered" className="space-y-2 pt-3">
          <Select
            value={value.clientId || ""}
            onValueChange={(id) => onChange({ ...value, clientId: id })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[100] max-h-[300px]">
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsContent>

        <TabsContent value="manual" className="space-y-3 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome / Empresa *</Label>
              <Input
                value={value.manual.nome}
                maxLength={120}
                onChange={(e) => onChange({ ...value, manual: { ...value.manual, nome: e.target.value } })}
                placeholder="Ex: Empresa XPTO, Lda."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone *</Label>
              <Input
                value={value.manual.telefone}
                maxLength={30}
                onChange={(e) => onChange({ ...value, manual: { ...value.manual, telefone: e.target.value } })}
                placeholder="+258 ..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={value.manual.email}
                maxLength={120}
                onChange={(e) => onChange({ ...value, manual: { ...value.manual, email: e.target.value } })}
                placeholder="contato@empresa.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">NUIT</Label>
              <Input
                value={value.manual.nuit || ""}
                maxLength={30}
                onChange={(e) => onChange({ ...value, manual: { ...value.manual, nuit: e.target.value } })}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Endereço</Label>
            <Textarea
              value={value.manual.endereco}
              maxLength={300}
              rows={2}
              onChange={(e) => onChange({ ...value, manual: { ...value.manual, endereco: e.target.value } })}
              placeholder="Rua, número, cidade..."
            />
          </div>

          {!hideSaveOption && (
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="save-to-base"
                checked={value.saveToBase || requireSaveOnManual}
                disabled={requireSaveOnManual}
                onCheckedChange={(c) => onChange({ ...value, saveToBase: !!c })}
              />
              <label htmlFor="save-to-base" className="text-sm cursor-pointer">
                Salvar este cliente na minha base
                {requireSaveOnManual && (
                  <span className="ml-1 text-xs text-muted-foreground">(obrigatório)</span>
                )}
              </label>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export interface ResolvedRecipient {
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  nuit?: string | null;
  /** Present when the recipient corresponds to a row in `clients`. */
  client_id?: string;
}

/** Validates and resolves a RecipientState into a ready-to-render client object.
 *  If avulso + saveToBase, inserts into `clients` and returns the new id. */
export async function resolveRecipient(
  state: RecipientState,
  registeredClient?: Client | null,
): Promise<ResolvedRecipient> {
  if (state.mode === "registered") {
    if (!state.clientId) throw new Error("Selecione um cliente cadastrado");
    if (!registeredClient) throw new Error("Cliente não encontrado");
    return {
      nome: registeredClient.nome,
      telefone: registeredClient.telefone,
      email: registeredClient.email,
      endereco: registeredClient.endereco,
      client_id: registeredClient.id,
    };
  }

  // manual
  const { nome, telefone, email, endereco, nuit } = state.manual;
  if (!nome.trim()) throw new Error("Nome do cliente avulso é obrigatório");
  if (!telefone.trim()) throw new Error("Telefone do cliente avulso é obrigatório");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("Email inválido");
  }

  if (state.saveToBase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sessão expirada");
    const { data, error } = await supabase
      .from("clients")
      .insert([{
        user_id: user.id,
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim() || null,
        endereco: endereco.trim() || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return {
      nome: data.nome,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      nuit: nuit?.trim() || null,
      client_id: data.id,
    };
  }

  return {
    nome: nome.trim(),
    telefone: telefone.trim(),
    email: email.trim() || null,
    endereco: endereco.trim() || null,
    nuit: nuit?.trim() || null,
  };
}
