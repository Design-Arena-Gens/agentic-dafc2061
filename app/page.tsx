"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { buildCreditsMarkdown, buildMetadataJson, evaluatePolicy } from "@lib/metadata";
import { downloadText } from "@lib/download";

const transformationsList = [
  "Paleta propia",
  "Redibujo/pixel over completo",
  "Cambio de silueta",
  "Dithering controlado",
  "Outline reprocesado",
  "Composici?n con capas CC0",
];

const assetSchema = z.object({
  name: z.string().min(1),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceType: z.enum(["CC0", "Freepik", "Original", "Otro"]),
  isPrimaryValue: z.boolean().default(false),
  transformations: z.array(z.string()).default([]),
  attribution: z.string().optional(),
});

type AssetInput = z.infer<typeof assetSchema>;

export default function HomePage() {
  const [collectionName, setCollectionName] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [baseExternalUrl, setBaseExternalUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [assets, setAssets] = useState<AssetInput[]>([]);

  const [paletteName, setPaletteName] = useState("");

  const policy = useMemo(() => evaluatePolicy({ assets }), [assets]);

  const onAddAsset = () => {
    setAssets((prev) => [
      ...prev,
      {
        name: "",
        sourceUrl: "",
        sourceType: "CC0",
        isPrimaryValue: false,
        transformations: [],
        attribution: "",
      },
    ]);
  };

  const onUpdateAsset = (index: number, key: keyof AssetInput, value: any) => {
    setAssets((prev) => prev.map((a, i) => (i === index ? { ...a, [key]: value } : a)));
  };

  const onToggleTransformation = (index: number, t: string) => {
    const current = assets[index];
    const has = current.transformations.includes(t);
    onUpdateAsset(
      index,
      "transformations",
      has ? current.transformations.filter((x) => x !== t) : [...current.transformations, t]
    );
  };

  const onRemoveAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const metadata = useMemo(
    () =>
      buildMetadataJson({
        collectionName,
        creator,
        description,
        baseExternalUrl,
        paletteName,
        notes,
        assets,
      }),
    [collectionName, creator, description, baseExternalUrl, paletteName, notes, assets]
  );

  const credits = useMemo(
    () =>
      buildCreditsMarkdown({
        collectionName,
        creator,
        paletteName,
        assets,
        notes,
      }),
    [collectionName, creator, paletteName, assets, notes]
  );

  const exportMetadata = () => {
    downloadText(JSON.stringify(metadata, null, 2), "metadata.json");
  };
  const exportCredits = () => {
    downloadText(credits, "credits.md");
  };

  const loadMiniPractica = () => {
    setCollectionName("Bakala Pixels");
    setCreator("Bakala Studio");
    setDescription("Colecci?n de pixel art original derivada de referencias CC0 y bocetos Freepik.");
    setBaseExternalUrl("https://example.com/bakala");
    setPaletteName("Bakala-16");
    setNotes(
      "Freepik usado s?lo como referencia de composici?n. Todo pixel art final redibujado a mano con paleta propia."
    );
    setAssets([
      {
        name: "Guerrero - base CC0",
        sourceUrl: "https://kenney.nl/assets/cc0-sample",
        sourceType: "CC0",
        isPrimaryValue: false,
        transformations: ["Paleta propia", "Redibujo/pixel over completo", "Outline reprocesado"],
        attribution: "CC0 autores varios (Kenney et al.)",
      },
      {
        name: "Boceto referencia (no incluido)",
        sourceUrl: "https://www.freepik.com/sample",
        sourceType: "Freepik",
        isPrimaryValue: false,
        transformations: ["Composici?n con capas CC0", "Cambio de silueta"],
        attribution: "Freepik autor X (uso como referencia/boceto, no se redistribuye)",
      },
    ]);
  };

  return (
    <div className="wrapper">
      <section className="card">
        <h2>Colecci?n</h2>
        <div className="grid">
          <label>
            <span>Nombre</span>
            <input value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
          </label>
          <label>
            <span>Creador</span>
            <input value={creator} onChange={(e) => setCreator(e.target.value)} />
          </label>
          <label className="full">
            <span>Descripci?n</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            <span>URL base externa</span>
            <input value={baseExternalUrl} onChange={(e) => setBaseExternalUrl(e.target.value)} />
          </label>
          <label>
            <span>Paleta</span>
            <input value={paletteName} onChange={(e) => setPaletteName(e.target.value)} />
          </label>
          <label className="full">
            <span>Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="card">
        <div className="row">
          <h2>Assets</h2>
          <button className="secondary" onClick={onAddAsset}>A?adir asset</button>
          <button className="ghost" onClick={loadMiniPractica}>Cargar mini-pr?ctica</button>
        </div>
        {assets.length === 0 && <p className="muted">A?n no hay assets. A?ade uno para empezar.</p>}
        <div className="assets">
          {assets.map((a, i) => (
            <div className="asset" key={i}>
              <div className="row">
                <strong>#{i + 1}</strong>
                <button className="danger" onClick={() => onRemoveAsset(i)}>Eliminar</button>
              </div>
              <label>
                <span>Nombre</span>
                <input value={a.name} onChange={(e) => onUpdateAsset(i, "name", e.target.value)} />
              </label>
              <label>
                <span>URL origen</span>
                <input value={a.sourceUrl ?? ""} onChange={(e) => onUpdateAsset(i, "sourceUrl", e.target.value)} />
              </label>
              <label>
                <span>Tipo origen</span>
                <select value={a.sourceType} onChange={(e) => onUpdateAsset(i, "sourceType", e.target.value)}>
                  {(["CC0", "Freepik", "Original", "Otro"] as const).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={a.isPrimaryValue}
                  onChange={(e) => onUpdateAsset(i, "isPrimaryValue", e.target.checked)}
                />
                <span>?Valor principal del NFT?</span>
              </label>
              <div>
                <span className="label">Transformaciones</span>
                <div className="chips">
                  {transformationsList.map((t) => (
                    <button
                      key={t}
                      className={a.transformations.includes(t) ? "chip active" : "chip"}
                      onClick={() => onToggleTransformation(i, t)}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span>Atribuci?n (si aplica)</span>
                <input value={a.attribution ?? ""} onChange={(e) => onUpdateAsset(i, "attribution", e.target.value)} />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Chequeo de riesgo</h2>
        {policy.issues.length === 0 ? (
          <p className="ok">Sin banderas rojas. Pol?tica cumplida.</p>
        ) : (
          <ul className="issues">
            {policy.issues.map((x, idx) => (
              <li key={idx}>{x}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2>Artefactos</h2>
        <div className="row">
          <button onClick={exportMetadata}>Descargar metadata.json</button>
          <button className="secondary" onClick={exportCredits}>Descargar credits.md</button>
        </div>
        <details>
          <summary>Vista previa metadata.json</summary>
          <pre className="preview">{JSON.stringify(metadata, null, 2)}</pre>
        </details>
        <details>
          <summary>Vista previa credits.md</summary>
          <pre className="preview">{credits}</pre>
        </details>
      </section>
    </div>
  );
}
