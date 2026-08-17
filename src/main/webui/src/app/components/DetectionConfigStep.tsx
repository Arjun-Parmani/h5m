import type { EDivisiveConfig, FixedThresholdConfig, NodeConfiguration, NodeType, RelativeDifferenceConfig, StdDevAnomalyConfig } from '@client/types.gen.ts';
import type { FormAsyncValidateOrFn, FormValidateOrFn } from '@tanstack/form-core';
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import { Checkbox, Select, SelectItem, Stack, TextInput } from '@carbon/react';

import type { FormValues } from './CreateNodeModal';

export const DETECTION_SOURCES: { name: 'srcFingerprint' | 'srcGroupBy' | 'srcRange'; label: string; allowedTypes: NodeType[] }[] = [
  { name: 'srcFingerprint', label: 'Fingerprint node', allowedTypes: ['FINGERPRINT'] },
  { name: 'srcGroupBy', label: 'GroupBy node', allowedTypes: ['JQ', 'JS', 'JSONATA', 'SPLIT'] },
  { name: 'srcRange', label: 'Range node', allowedTypes: ['JQ', 'JS', 'JSONATA', 'SPLIT'] },
];

type NumericConfigField =
  | 'ftConfig.max'
  | 'ftConfig.min'
  | 'rdConfig.minPrevious'
  | 'rdConfig.threshold'
  | 'rdConfig.window'
  | 'sdConfig.deviations'
  | 'sdConfig.minDataPoints'
  | 'sdConfig.windowSize'
  | 'edConfig.maxPvalue'
  | 'edConfig.maxSeriesLength'
  | 'edConfig.minMagnitude'
  | 'edConfig.windowLen';

type DetectionFieldDef =
  | { kind: 'number'; name: NumericConfigField; id: string; label: string; placeholder: string; helperText?: string }
  | { kind: 'select'; name: 'rdConfig.filter' | 'sdConfig.direction'; id: string; label: string; options: { value: string; text: string }[] }
  | { kind: 'checkbox'; name: 'ftConfig.minInclusive' | 'ftConfig.maxInclusive'; id: string; label: string };

const DETECTION_FIELDS: Partial<Record<NodeType, DetectionFieldDef[]>> = {
  FIXED_THRESHOLD: [
    { kind: 'number', name: 'ftConfig.min', id: 'ft-min', label: 'Min', placeholder: '0' },
    { kind: 'checkbox', name: 'ftConfig.minInclusive', id: 'ft-min-inclusive', label: 'Min inclusive' },
    { kind: 'number', name: 'ftConfig.max', id: 'ft-max', label: 'Max', placeholder: '100' },
    { kind: 'checkbox', name: 'ftConfig.maxInclusive', id: 'ft-max-inclusive', label: 'Max inclusive' },
  ],
  RELATIVE_DIFFERENCE: [
    {
      kind: 'select',
      name: 'rdConfig.filter',
      id: 'rd-filter',
      label: 'Aggregation filter',
      options: ['mean', 'median', 'min', 'max'].map((f) => ({ value: f, text: f })),
    },
    { kind: 'number', name: 'rdConfig.threshold', id: 'rd-threshold', label: 'Threshold (fraction)', placeholder: '0.2', helperText: 'e.g. 0.2 = 20%' },
    { kind: 'number', name: 'rdConfig.window', id: 'rd-window', label: 'Window', placeholder: '1', helperText: 'Recent values to compare' },
    { kind: 'number', name: 'rdConfig.minPrevious', id: 'rd-min-previous', label: 'Min previous', placeholder: '5', helperText: 'History required' },
  ],
  STDDEV_ANOMALY: [
    { kind: 'number', name: 'sdConfig.windowSize', id: 'sd-window', label: 'Window size', placeholder: '10' },
    { kind: 'number', name: 'sdConfig.deviations', id: 'sd-deviations', label: 'Deviations', placeholder: '2.0' },
    { kind: 'number', name: 'sdConfig.minDataPoints', id: 'sd-min-dp', label: 'Min data points', placeholder: '5' },
    {
      kind: 'select',
      name: 'sdConfig.direction',
      id: 'sd-direction',
      label: 'Direction',
      options: [
        { value: 'BOTH', text: 'Both' },
        { value: 'UPPER', text: 'Upper' },
        { value: 'LOWER', text: 'Lower' },
      ],
    },
  ],
  EDIVISIVE: [
    {
      kind: 'number',
      name: 'edConfig.windowLen',
      id: 'ed-window',
      label: 'Window length',
      placeholder: '50',
      helperText: 'Min 3; ≥100 data points recommended',
    },
    { kind: 'number', name: 'edConfig.maxPvalue', id: 'ed-pvalue', label: 'Max p-value', placeholder: '0.001', helperText: 'Significance threshold' },
    { kind: 'number', name: 'edConfig.minMagnitude', id: 'ed-magnitude', label: 'Min magnitude', placeholder: '0.0', helperText: 'e.g. 0.1 = 10% change' },
    {
      kind: 'number',
      name: 'edConfig.maxSeriesLength',
      id: 'ed-max-series',
      label: 'Max series length',
      placeholder: '500',
      helperText: 'Most recent N points to analyze',
    },
  ],
};

export function buildConfig(v: FormValues): NodeConfiguration | undefined {
  switch (v.type) {
    case 'FIXED_THRESHOLD': {
      const cfg: FixedThresholdConfig = { minInclusive: v.ftConfig.minInclusive, maxInclusive: v.ftConfig.maxInclusive };
      if (v.ftConfig.min !== '') cfg.min = Number(v.ftConfig.min);
      if (v.ftConfig.max !== '') cfg.max = Number(v.ftConfig.max);
      if (v.ftConfig.fingerprintFilter) cfg.fingerprintFilter = v.ftConfig.fingerprintFilter;
      return cfg;
    }
    case 'RELATIVE_DIFFERENCE': {
      const cfg: RelativeDifferenceConfig = {
        filter: v.rdConfig.filter,
        threshold: Number(v.rdConfig.threshold),
        window: Number(v.rdConfig.window),
        minPrevious: Number(v.rdConfig.minPrevious),
      };
      if (v.rdConfig.fingerprintFilter) cfg.fingerprintFilter = v.rdConfig.fingerprintFilter;
      return cfg;
    }
    case 'STDDEV_ANOMALY': {
      const cfg: StdDevAnomalyConfig = {
        windowSize: Number(v.sdConfig.windowSize),
        deviations: Number(v.sdConfig.deviations),
        direction: v.sdConfig.direction,
        minDataPoints: Number(v.sdConfig.minDataPoints),
      };
      if (v.sdConfig.fingerprintFilter) cfg.fingerprintFilter = v.sdConfig.fingerprintFilter;
      return cfg;
    }
    case 'EDIVISIVE': {
      const cfg: EDivisiveConfig = {
        windowLen: Number(v.edConfig.windowLen),
        maxPvalue: Number(v.edConfig.maxPvalue),
        minMagnitude: Number(v.edConfig.minMagnitude),
        maxSeriesLength: Number(v.edConfig.maxSeriesLength),
      };
      if (v.edConfig.fingerprintFilter) cfg.fingerprintFilter = v.edConfig.fingerprintFilter;
      return cfg;
    }
    default:
      return undefined;
  }
}

type V = FormValidateOrFn<FormValues> | undefined;
type VA = FormAsyncValidateOrFn<FormValues> | undefined;
type NodeFormApi = ReactFormExtendedApi<FormValues, V, V, VA, V, VA, V, VA, V, VA, VA, unknown>;

interface DetectionConfigStepProps {
  form: NodeFormApi;
  nodeType: NodeType;
}

export const DetectionConfigStep = ({ form, nodeType }: DetectionConfigStepProps) => {
  const fields = DETECTION_FIELDS[nodeType];
  if (!fields) return null;

  return (
    <Stack gap={6}>
      {fields.map((f) => {
        switch (f.kind) {
          case 'number':
            return (
              <form.Field key={f.id} name={f.name}>
                {(field) => (
                  <TextInput
                    id={f.id}
                    labelText={f.label}
                    placeholder={f.placeholder}
                    type="number"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    helperText={f.helperText}
                  />
                )}
              </form.Field>
            );
          case 'checkbox':
            return (
              <form.Field key={f.id} name={f.name}>
                {(field) => (
                  <Checkbox
                    id={f.id}
                    labelText={f.label}
                    checked={field.state.value}
                    onChange={(_, { checked }) => {
                      field.handleChange(checked);
                    }}
                  />
                )}
              </form.Field>
            );
          case 'select':
            return (
              <form.Field key={f.id} name={f.name}>
                {(field) => (
                  <Select
                    id={f.id}
                    labelText={f.label}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                  >
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value} text={o.text} />
                    ))}
                  </Select>
                )}
              </form.Field>
            );
        }
      })}
    </Stack>
  );
};
