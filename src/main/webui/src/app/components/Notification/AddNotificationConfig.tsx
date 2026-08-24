import {
  Button,
  MenuButton,
  MenuItem,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  Tag,
} from '@carbon/react';
import { useState } from 'react';
import { extractErrorMessage } from '@app/context/NotificationProvider.tsx';
import { useNotification } from '@app/context/useNotification.tsx';
import { listConfigsOptions, deleteConfigMutation } from '@client/@tanstack/react-query.gen';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { NotificationConfigResponse } from '@client/types.gen';
import CreateNotificationModal from '@app/components/Notification/CreateNotificationModal';
import DeleteNotiConfigModal from '@app/components/Notification/DeleteNotiConfigModal';
import EditNotiConfigModal from '@app/components/Notification/EditNotiConfigModal';

function getDestination(config: NotificationConfigResponse): string {
  if (!config.data) return '';
  try {
    const parsed = JSON.parse(config.data);
    switch (config.method) {
      case 'WEBHOOK': return parsed.url ?? '';
      case 'EMAIL': return parsed.to ?? '';
      case 'SLACK': return parsed.channel ?? '';
      case 'GITHUB_ISSUE': return `${parsed.owner ?? ''}/${parsed.repo ?? ''}`;
      default: return '';
    }
  } catch {
    return config.data;
  }
}

export default function AddNotificationConfig({ folderId }: { folderId: number }){
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const notifications = useNotification();
  const [configToDelete, setConfigToDelete] = useState<NotificationConfigResponse | null>(null);
  const [configToEdit, setConfigToEdit] = useState<NotificationConfigResponse | null>(null);


  const { data: configs } = useSuspenseQuery(listConfigsOptions({ query: { folderId } }));

  return(
      <>
        <Button
          kind="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          className="create-folder-btn"
          style={{ margin: 'var(--cds-spacing-05)' }}>
          Create Notification Config
          </Button>
        <CreateNotificationModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          folderId={folderId}
        />
         <DeleteNotiConfigModal
          open={configToDelete !== null}
          onClose={() => setConfigToDelete(null)}
          config={configToDelete}
         />
         <EditNotiConfigModal
          open={configToEdit !==null}
          onClose={()=>setConfigToEdit(null)}
          config={configToEdit}
         />
        {configs.length === 0 ? (
          <p style={{ margin: 'var(--cds-spacing-05)' }}>No notifications configured</p>
        ) : (
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>Method</StructuredListCell>
              <StructuredListCell head>Enabled</StructuredListCell>
              <StructuredListCell head>Destination</StructuredListCell>
              <StructuredListCell head />
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {configs?.map((config: NotificationConfigResponse) => (
              <StructuredListRow key={config.id}>
                <StructuredListCell>
                  <Tag size="sm">{config.method}</Tag>
                </StructuredListCell>
                <StructuredListCell>
                  {config.enabled ? 'Yes' : 'No'}
                </StructuredListCell>
                <StructuredListCell>
                  {getDestination(config)}
                </StructuredListCell>
                <StructuredListCell>
                  <MenuButton label="Action" kind="ghost" size="sm" menuAlignment="bottom-end">
                    <MenuItem label="Delete" kind="danger" onClick={() => setConfigToDelete(config) } />
                    <MenuItem label="Edit" kind ="primary" onClick={()=> setConfigToEdit(config) } />
                  </MenuButton>
                </StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
        )}
      </>
    );
  }
