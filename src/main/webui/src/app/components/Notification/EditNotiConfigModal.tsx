import { extractErrorMessage } from '@app/context/NotificationProvider.tsx';
import { useNotification } from '@app/context/useNotification.tsx';
import { useState, useEffect } from 'react';
import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    TextInput,
    Toggle,
    Button
  } from '@carbon/react';
import { updateConfigMutation } from '@client/@tanstack/react-query.gen';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationConfigResponse } from '@client/types.gen';

interface EditNotiConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: NotificationConfigResponse | null;
}
export default function EditNotiConfigModal({ open, onClose, config }: EditNotiConfigModalProps){
  const notifications = useNotification();
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(true);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    if (open && config) {
      setEnabled(config.enabled ?? true);
      try {
        const parsed = JSON.parse(config.data ?? '');
        setDestination(parsed.to ?? '');
      } catch {
        setDestination(config.data ?? '');
      }
    }
  }, [open, config]);

  const editConfig = useMutation({
    ...updateConfigMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      notifications.success('Notification config updated');
      handleClose();
    },
    onError: (e) => {
      notifications.error(extractErrorMessage(e) ?? 'Failed to update notification config');
    },
  });

  const handleSave = () => {
    if (!config?.id) return;
    let body: string;
    try {
      const parsed = JSON.parse(config.data ?? '{}');
      parsed.to = destination;
      body = JSON.stringify(parsed);
    } catch {
      body = JSON.stringify({ to: destination });
    }
    editConfig.mutate({
      path: { id: config.id },
      query: {
        enabled: enabled,
      },
      body: body,
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <ComposedModal open={open} onClose={handleClose}>
        <ModalHeader title="Edit Notification" />
        <ModalBody>
          <Toggle
            id="edit-enabled-toggle"
            labelA="Off"
            labelB="On"
            labelText="Enabled"
            toggled={enabled}
            onToggle={(checked) => setEnabled(checked)}
          />
          <br />
          <TextInput
            id="edit-destination-name"
            labelText="Destination (required)"
            placeholder="e.g. https://hooks.example.com"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button kind="primary" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ComposedModal>
    </>
  );
}
