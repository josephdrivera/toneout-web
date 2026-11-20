"use client";

import { FormEvent, useState } from "react";

export type CaptureSettings = {
  name: string;
  mount: string;
  inputType: "alsa" | "rtl_fm" | "file";
  device?: string;
  frequencyMhz?: number;
  gain?: number;
  path?: string;
  squelchOpen?: number;
  squelchClose?: number;
  record?: boolean;
  tones: Array<{
    department: string;
    label: string;
    toneA: number;
    toneB: number;
  }>;
};

type ToneRow = { label: string; department: string; toneA: string; toneB: string };

const inputClass =
  "w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-base text-textPrimary placeholder:text-textHint focus:border-borderBright focus:outline-none sm:text-sm";
const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-textMuted";
const smallButton =
  "rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary disabled:opacity-50";

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export default function AudioSettings({
  nodeId,
  town,
  defaultInput,
  current,
  onSaved,
  onClose,
}: {
  nodeId: string;
  town: string;
  defaultInput: "alsa" | "rtl_fm";
  current?: CaptureSettings;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(current?.name ?? "");
  const [mount, setMount] = useState(current?.mount ?? "");
  const [mountTouched, setMountTouched] = useState(Boolean(current?.mount));
  const [inputType, setInputType] = useState<CaptureSettings["inputType"]>(
    current?.inputType ?? defaultInput,
  );
  const [device, setDevice] = useState(current?.device ?? "plughw:1,0");
  const [frequency, setFrequency] = useState(
    current?.frequencyMhz !== undefined ? String(current.frequencyMhz) : "",
  );
  const [gain, setGain] = useState(
    current?.gain !== undefined ? String(current.gain) : "",
  );
  const [path, setPath] = useState(current?.path ?? "");
  const [squelchOpen, setSquelchOpen] = useState(
    current?.squelchOpen !== undefined ? String(current.squelchOpen) : "",
  );
  const [squelchClose, setSquelchClose] = useState(
    current?.squelchClose !== undefined ? String(current.squelchClose) : "",
  );
  const [record, setRecord] = useState(current?.record === true);
  const [tones, setTones] = useState<ToneRow[]>(
    (current?.tones ?? []).map((tone) => ({
      label: tone.label,
      department: tone.department,
      toneA: String(tone.toneA),
      toneB: String(tone.toneB),
    })),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const townSlug = slug(town) || "town";

  function updateTone(index: number, patch: Partial<ToneRow>) {
    setTones((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        // Keep the id following the name until someone edits the id itself.
        if (
          patch.label !== undefined &&
          (row.department === "" ||
            row.department === `${townSlug}-${slug(row.label)}`)
        ) {
          next.department = `${townSlug}-${slug(patch.label)}`;
        }
        return next;
      }),
    );
  }

  async function send(capture: unknown) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "configure", nodeId, capture }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Could not save.");
        return;
      }
      onSaved();
    } catch {
      setError("Could not save. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    void send({
      name,
      mount,
      inputType,
      device,
      frequencyMhz: frequency,
      gain,
      path,
      squelchOpen,
      squelchClose,
      record,
      tones: tones.filter(
        (tone) => tone.label.trim() || tone.toneA.trim() || tone.toneB.trim(),
      ),
    });
  }

  return (
    <form
      onSubmit={save}
      className="mt-4 space-y-4 rounded-lg border border-borderBright bg-background px-4 py-4"
    >
      <div>
        <p className="text-xs font-bold text-textPrimary">Audio settings</p>
        <p className="mt-1 text-[11px] leading-relaxed text-textBody">
          The node downloads these at its next check-in, within about a
          minute, and restarts its audio by itself.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Channel name</label>
          <input
            className={inputClass}
            placeholder="Easttown Fire Dispatch"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!mountTouched) setMount(slug(event.target.value));
            }}
          />
        </div>
        <div>
          <label className={labelClass}>Stream name (in the web address)</label>
          <input
            className={inputClass}
            placeholder="easttown-dispatch"
            value={mount}
            onChange={(event) => {
              setMountTouched(true);
              setMount(event.target.value.toLowerCase());
            }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Audio comes from</label>
          <select
            className={inputClass}
            value={inputType}
            onChange={(event) =>
              setInputType(event.target.value as CaptureSettings["inputType"])
            }
          >
            <option value="alsa">Scanner audio jack (USB sound card)</option>
            <option value="rtl_fm">Radio dongle (one channel)</option>
            <option value="file">Test recording on the node</option>
          </select>
        </div>
        {inputType === "alsa" && (
          <div>
            <label className={labelClass}>Sound card</label>
            <input
              className={inputClass}
              placeholder="plughw:1,0"
              value={device}
              onChange={(event) => setDevice(event.target.value)}
            />
          </div>
        )}
        {inputType === "rtl_fm" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Frequency (MHz)</label>
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="453.075"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Gain, optional</label>
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="auto"
                value={gain}
                onChange={(event) => setGain(event.target.value)}
              />
            </div>
          </div>
        )}
        {inputType === "file" && (
          <div>
            <label className={labelClass}>Recording path on the node</label>
            <input
              className={inputClass}
              placeholder="/opt/toneout-hub/test-loop.mp3"
              value={path}
              onChange={(event) => setPath(event.target.value)}
            />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={`${labelClass} mb-0`}>
            Tone pairs to listen for ({tones.length})
          </label>
          <button
            type="button"
            className={smallButton}
            onClick={() =>
              setTones([
                ...tones,
                { label: "", department: "", toneA: "", toneB: "" },
              ])
            }
          >
            Add tone pair
          </button>
        </div>
        {tones.length === 0 && (
          <p className="text-[11px] text-textMuted">
            None. The node will stream audio but report no tone-outs.
          </p>
        )}
        <div className="space-y-2">
          {tones.map((tone, index) => (
            <div
              key={index}
              className="rounded-md border border-border bg-surface px-3 py-3"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  className={`${inputClass} col-span-2`}
                  placeholder="Company 1"
                  value={tone.label}
                  onChange={(event) =>
                    updateTone(index, { label: event.target.value })
                  }
                />
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Tone A Hz"
                  value={tone.toneA}
                  onChange={(event) =>
                    updateTone(index, { toneA: event.target.value })
                  }
                />
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Tone B Hz"
                  value={tone.toneB}
                  onChange={(event) =>
                    updateTone(index, { toneB: event.target.value })
                  }
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className={`${inputClass} font-mono text-xs sm:text-xs`}
                  placeholder="id, e.g. easttown-company-1"
                  value={tone.department}
                  onChange={(event) =>
                    updateTone(index, {
                      department: event.target.value.toLowerCase(),
                    })
                  }
                />
                <button
                  type="button"
                  className={`${smallButton} shrink-0`}
                  onClick={() => setTones(tones.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <details className="text-xs text-textBody">
        <summary className="cursor-pointer font-semibold">
          Squelch and clips (optional)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Open level</label>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="500"
              value={squelchOpen}
              onChange={(event) => setSquelchOpen(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Close level</label>
            <input
              className={inputClass}
              inputMode="numeric"
              placeholder="350"
              value={squelchClose}
              onChange={(event) => setSquelchClose(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-2.5 text-xs text-textSecondary">
            <input
              type="checkbox"
              checked={record}
              onChange={(event) => setRecord(event.target.checked)}
            />
            Save each transmission as a clip
          </label>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-textMuted">
          Levels run from 1 to 32767. Compare them with the node&apos;s Audio
          level reading while someone is talking and while the channel is
          quiet.
        </p>
      </details>

      {error && <p className="text-xs text-fire">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={busy || !name.trim() || !mount.trim()}
          className="rounded-md bg-fire/90 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-fire disabled:opacity-50"
        >
          Save audio settings
        </button>
        <button type="button" className={smallButton} onClick={onClose}>
          Cancel
        </button>
        {current &&
          (confirmClear ? (
            <>
              <span className="text-xs text-textSecondary">
                Stop this node&apos;s audio?
              </span>
              <button
                type="button"
                disabled={busy}
                className="rounded-md bg-fire/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-fire disabled:opacity-50"
                onClick={() => void send(null)}
              >
                Yes, clear
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${smallButton} ml-auto`}
              onClick={() => setConfirmClear(true)}
            >
              Clear settings
            </button>
          ))}
      </div>
    </form>
  );
}
