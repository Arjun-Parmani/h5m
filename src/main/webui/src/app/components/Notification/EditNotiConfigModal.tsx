import { extractErrorMessage } from '@app/context/NotificationProvider.tsx';
import { useNotification } from '@app/context/useNotification.tsx';
import { fieldError } from '@app/validation.ts';
import { useEffect, useState } from 'react';
import {
  Button,
  ComposedModal,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  TextInput,
  Toggle,
} from '@carbon/react';
import { updateConfigMutation } from '@client/@tanstack/react-query.gen';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationConfigResponse } from '@client/types.gen';
import { z } from 'zod';

interface EditNotiConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: NotificationConfigResponse | null;
}

interface FormValues {
  enabled: boolean;
  destination: string;
}

const DEFAULT_VALUES: FormValues = {
  enabled: true,
  destination: '',
};

const required = z.string().min(1, 'Required');

function destinationKey(method?: string): string {
  switch (method) {
    case 'WEBHOOK': return 'url';
    case 'EMAIL': return 'to';
    case 'SLACK': return 'channel';
    case 'GITHUB_ISSUE': return 'repo';
    default: return 'to';
  }
}

function destinationLabel(method?: string): string {
  switch (method) {
    case 'WEBHOOK': return 'URL (required)';
    case 'EMAIL': return 'Recipients (required)';
    case 'SLACK': return 'Channel (required)';
    case 'GITHUB_ISSUE': return 'Repository (required)';
    default: return 'Destination (required)';
  }
}

export default function EditNotiConfigModal({ open, onClose, config }: EditNotiConfigModalProps) {
  const notifications = useNotification();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editConfig = useMutation({
    ...updateConfigMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      notifications.success('Notification config updated');
      handleClose();
    },
    onError: (e) => {
      setSubmitError(extractErrorMessage(e) ?? 'Failed to update notification config');
    },
  });

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: ({ value }) => {
      if (!config?.id) return;
      setSubmitError(null);
      const key = destinationKey(config.method);
      let body: string;
      try {
        const parsed = JSON.parse(config.data ?? '{}');
        parsed[key] = value.destination;
        body = JSON.stringify(parsed);
      } catch {
        body = JSON.stringify({ [key]: value.destination });
      }
      editConfig.mutate({
        path: { id: config.id },
        query: { enabled: value.enabled },
        body,
      });
    },
  });

  useEffect(() => {
    if (open && config) {
      form.setFieldValue('enabled', config.enabled ?? true);
      try {
        const parsed = JSON.parse(config.data ?? '');
        const key = destinationKey(config.method);
        form.setFieldValue('destination', parsed[key] ?? '');
      } catch {
        form.setFieldValue('destination', config.data ?? '');
      }
    }
  }, [open, config]);

  const handleClose = () => {
    form.reset();
    setSubmitError(null);
    onClose();
  };

  return (
    <ComposedModal open={open} onClose={handleClose}>
      <ModalHeader title="Edit Notification" />
      <ModalBody>
        <Form onSubmit={(e) => e.preventDefault()}>
          <Stack gap={6}>
            <form.Field name="enabled">
              {(field) => (
                <Toggle
                  id="edit-enabled-toggle"
                  labelA="Off"
                  labelB="On"
                  labelText="Enabled"
                  toggled={field.state.value}
                  onToggle={(checked) => field.handleChange(checked)}
                />
              )}
            </form.Field>

            <form.Field name="destination" validators={{ onSubmit: required, onBlur: required }}>
              {(field) => (
                <TextInput
                  id="edit-destination-name"
                  type={config?.method === 'WEBHOOK' ? 'url' : config?.method === 'EMAIL' ? 'email' : 'text'}
                  labelText={destinationLabel(config?.method)}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  invalid={field.state.meta.errors.length > 0}
                  invalidText={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>

            {submitError && (
              <InlineNotification
                kind="error"
                lowContrast
                title="Failed to update notification"
                subtitle={submitError}
                onCloseButtonClick={() => setSubmitError(null)}
              />
            )}
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button kind="primary" disabled={editConfig.isPending} onClick={() => void form.handleSubmit()}>
          {editConfig.isPending ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
