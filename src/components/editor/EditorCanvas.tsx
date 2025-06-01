import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  NodeProps,
  ConnectionLineType,
  getRectOfNodes,
  getTransformForBounds,
  useReactFlow,
  useStoreApi,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';
import {
  Plus,
  Search,
  Copy,
  Download,
  Sparkles,
  Maximize2,
  Trash2,
  Scissors,
  Clipboard,
  Home,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import EnhancedToolbar from './EditorToolbar';

import WireframePageNode from './nodes/WireframePageNode';
import PageNode from './nodes/PageNode';
import SectionNode from './nodes/SectionNode';
import ContextMenu from './ContextMenu';
import ComponentLibrary from './ComponentLibrary';

// ... (keep all other code exactly the same until handleShowNodeContextMenu)

Object.assign(handleShowNodeContextMenu, useCallback((nodeId: string, clickPos: { x: number; y: number }) => {
  const node = getNode(nodeId);
  if (!node) return;

  setNodeContextMenu({
    id: nodeId,
    x: clickPos.x,
    y: clickPos.y,
    items: [
      {
        label: 'Add Child Page',
        action: () => handleAddChildPage(nodeId),
        icon: <Plus size={16} />,
      },
      {
        label: 'Duplicate',
        action: () => handleDuplicateNode(nodeId),
        icon: <Copy size={16} />,
      },
      {
        label: 'Delete',
        action: () => handleDeleteNodes([nodeId]),
        icon: <Trash2 size={16} />,
      },
      {
        label: 'Cut',
        action: () => handleCutNodes([nodeId]),
        icon: <Scissors size={16} />,
      },
      {
        label: 'Copy',
        action: () => handleCopyNodes([nodeId]),
        icon: <Clipboard size={16} />,
      },
      {
        label: 'Set as Home Page',
        action: () => handleSetAsHomePage(nodeId),
        icon: <Home size={16} />,
      },
    ],
  });
}, [getNode, handleAddChildPage, handleDuplicateNode, handleDeleteNodes, handleCutNodes, handleCopyNodes, handleSetAsHomePage]));

// ... (keep all remaining code exactly the same)