import { Modal } from '@carbon/react';
import { deleteConfigMutation } from '@client/@tanstack/react-query.gen.ts';
import { extractErrorMessage } from '@app/context/NotificationProvider.tsx';
import { useNotification } from '@app/context/useNotification.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface DeleteNotiConfigModalProps {
  open: boolean;
  onClose: () => void;
  config: NotificationConfigResponse;
}

export default function DeleteNotiConfigModal({ open, onClose, config }: DeleteNotiConfigModalProps){
  const queryClient = useQueryClient();
  const notifications = useNotification();
  const [error, setError] = useState<string | null>(null);

   const deleteConfig = useMutation({
      ...deleteConfigMutation(),
      onSuccess: () => {
        void queryClient.invalidateQueries();
        notifications.success('Notification config deleted');
        handleClose();
      },
      onError: (e) => {
        notifications.error(extractErrorMessage(e) ?? 'Failed to delete notification config');
      },
    });
  const handleDelete = ()=>{

    deleteConfig.mutate({ path: { id: config.id! } })
    }

  const handleClose = ()=>{
    setError('');
    onClose();
    };

  return (
    <Modal
      open={config !== null}
      danger
      modalHeading="Delete config"
      modalLabel={config?.name ?? ''}
      primaryButtonText={deleteConfig.isPending ? 'Deleting…' : 'Delete'}
      secondaryButtonText="Cancel"
      primaryButtonDisabled={deleteConfig.isPending}
      onRequestSubmit={handleDelete}
      onRequestClose={() => { setError(null); handleClose(); }}
    >
      <p>
        Are you sure you want to delete <strong>{config?.name}</strong>?
      </p>
      <p style={{ marginTop: '0.75rem', color: 'var(--cds-text-secondary)' }}>
         This action cannot be undone.
      </p>
      {error && (
        <p style={{ marginTop: '0.75rem', color: 'var(--cds-support-error)' }}>
          {error}
        </p>
      )}
    </Modal>
  );
}
