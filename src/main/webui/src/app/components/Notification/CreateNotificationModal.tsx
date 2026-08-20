import { extractErrorMessage } from '@app/context/NotificationProvider.tsx';
import { useNotification } from '@app/context/useNotification.tsx';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Dropdown,
  Button
} from '@carbon/react';
import { createConfigMutation } from '@client/@tanstack/react-query.gen';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface CreateNotificationModalProps {
  open: boolean;
  onClose: () => void;
  folderId: number;
}


export default function CreateNotificationModal({ open, onClose, folderId }: CreateNotificationModalProps){
  const [selectedConfig,setSelectedConfig] = useState('');
  const notifications = useNotification();
   const queryClient = useQueryClient();
  const [SubmitError, setSubmitError] = useState<string | null>(null);

  // Web Hook
  const [url, setUrl] = useState('');
  const [auth, setAuth] = useState('');

  // Email
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');

  // Slack
  const [channel, setChannel] = useState('');
  const [slackToken, setSlackToken] = useState('');

  // Github Issue
  const [repo, setRepo] = useState('');
  const [owner, setOwner] = useState('');
  const [title, setTitle] = useState('');
  const [label, setLabel] = useState('');
  const [githubToken, setGithubToken] = useState('');

  const  createConfig = useMutation({
    ...createConfigMutation(),
    onSuccess: () => {
      void queryClient.invalidateQueries();
      notifications.success('Notification Config created');
      handleClose();
    },
    onError: (e) => {
      setSubmitError(extractErrorMessage(e) ?? 'Failed to create Notification config');
    },
  });
const handleSave= () =>{
    let requestBody = {};
    let secretData = "";

    switch (selectedConfig) {
      case 'WEBHOOK':
        requestBody = { url: url };
        secretData = auth;
        break;

      case 'EMAIL':
        requestBody = { to: recipients, subject: subject };
        secretData = "";
        break;

      case 'SLACK':
        requestBody = { channel: channel };
        secretData = slackToken;
        break;

      case 'GITHUB_ISSUE':
        requestBody = { repo: repo, owner: owner, title: title, label: label };
        secretData = githubToken;
        break;
    }
      createConfig.mutate({
        query: {
          folderId: folderId,
          method: selectedConfig,
          name: undefined,
          secrets: secretData
          },
        body: JSON.stringify(requestBody)
        });
    };

const handleClose = () => {
    setSubmitError(null);
    setSelectedConfig('');
    setUrl('');
    setAuth('');
    setRecipients('');
    setSubject('');
    setChannel('');
    setSlackToken('');
    setRepo('');
    setOwner('');
    setTitle('');
    setLabel('');
    setGithubToken('');
    onClose();
  };


  return (
      <>
        <ComposedModal open={open} onClose={onClose}>
          <ModalHeader
            title="Create Notification"
            closeModal={onClose}
          />

          <ModalBody>
          {/* This is where you will eventually add your Form, TextInputs, Selects, etc. */}
            <p style={{ marginBottom: '1rem' }}>
              Configure your new notification here.
            </p>
            <Dropdown
              aria-label=""
              direction="bottom"
              id="config"
              items={[
                { label: 'Web Hook', value: 'WEBHOOK' },
                { label: 'Email', value: 'EMAIL' },
                { label: 'Slack', value: 'SLACK' },
                { label: 'Github Issue', value: 'GITHUB_ISSUE' },
             ]
           }
              label="Choose an option"
              titleText="Config type"
              onChange={({ selectedItem }) => setSelectedConfig(selectedItem.value)}
          />
          <br />
          {/*for Web Hook*/}
          {selectedConfig === 'WEBHOOK' && (
           <>
            <TextInput
              id="url-name"
              labelText="Url (required)"
              placeholder="e.g. 'Http / Https '"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          <br />
            <TextInput
              id="Auth-name"
              labelText="Auth (optional)"
              placeholder="e.g. jascjsa"
              value={auth}
              onChange={(e) => setAuth(e.target.value)}
            />
            </>
           )}
          <br />


          {/*for Email*/}
          {selectedConfig === 'EMAIL' && (
            <>
             <TextInput
              id="Recipients-name"
              labelText="Recipients (required)"
              placeholder="e.g. abcd@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          <br />
              <TextInput
               id="subject-name"
               labelText="Subject (optional)"
               placeholder="e.g. Regresiion detcted for abcd node"
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
              />
            </>
            )}


          {/*for Slack*/}
          {selectedConfig === 'SLACK' && (
            <>
               <TextInput
                id="Channel-name"
                labelText="Channel (required)"
                placeholder="e.g. "
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
               />
          <br />
                <TextInput
                  id="token-name"
                  labelText="Token (required)"
                  placeholder="e.g. ***"
                  value={slackToken}
                  onChange={(e) => setSlackToken(e.target.value)}
                />
            </>
            )}
          {/* for Github Issues*/}
          {selectedConfig === 'GITHUB_ISSUE' && (
            <>
                  <TextInput
                    id="Repo-name"
                    labelText="Repo (required)"
                    placeholder="e.g. test github repo "
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                  />
  <br />
                  <TextInput
                    id="owner-name"
                    labelText="Owner (required)"
                    placeholder="e.g. Owner name"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
  <br />
                  <TextInput
                    id="title-name"
                    labelText="Title (optional)"
                    placeholder="e.g. Regression detected"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
   <br />
                    <TextInput
                      id="Label-name"
                      labelText="Label (optional)"
                      placeholder="e.g. "
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    />
  <br />
                  <TextInput
                    id="token-name"
                    labelText="Token (required)"
                    placeholder="e.g. ***"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
              </>
              )}


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
