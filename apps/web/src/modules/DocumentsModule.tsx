import React from 'react';
import { WorkspaceItem } from '../types/workspace';
import { UploadsDataModule } from './UploadsDataModule';

interface DocumentsModuleProps {
  workspace: WorkspaceItem;
  onAddToast: (msg: string) => void;
}

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({
  workspace,
  onAddToast,
}) => {
  return <UploadsDataModule workspace={workspace} onAddToast={onAddToast} />;
};

export default DocumentsModule;
