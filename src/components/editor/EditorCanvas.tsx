import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';

// Import your debug node
// import DebugPageNode from './nodes/DebugPageNode';

const nodeTypes = {
  page: DebugPageNode, // Replace with your debug node
};

const DebugEditorCanvas = () => {
  // Simple initial state
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: 'home',
      type: 'page',
      position: { x: 400, y: 200 },
      data: {
        label: 'Home',
        url: '/',
        description: 'Main landing page',
        isHomePage: true,
        sections: [],
      }
    }
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Debug: Simple add node function with lots of logging
  const handleAddNode = useCallback((direction: 'bottom' | 'left' | 'right', parentNodeId: string) => {
    console.log('🚀 handleAddNode called:', { direction, parentNodeId });
    
    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) {
      console.error('❌ Parent node not found:', parentNodeId);
      return;
    }

    console.log('✅ Parent node found:', parentNode);

    // Simple positioning logic
    const newNodeId = nanoid();
    let newPosition = { x: 0, y: 0 };

    switch (direction) {
      case 'bottom':
        newPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + 300
        };
        break;
      case 'left':
        newPosition = {
          x: parentNode.position.x - 400,
          y: parentNode.position.y
        };
        break;
      case 'right':
        newPosition = {
          x: parentNode.position.x + 400,
          y: parentNode.position.y
        };
        break;
    }

    const newNode: Node = {
      id: newNodeId,
      type: 'page',
      position: newPosition,
      data: {
        label: `New Page ${direction}`,
        url: `/new-page-${direction}`,
        description: `A new page added ${direction} of ${parentNode.data.label}`,
        sections: [],
        onAddNode: handleAddNode, // Pass the callback
      }
    };

    console.log('🆕 Creating new node:', newNode);

    // Update all existing nodes to have the callback
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onAddNode: handleAddNode,
      }
    }));

    // Add the new node
    setNodes([...updatedNodes, newNode]);

    // Add edge if it's a bottom (child) node
    if (direction === 'bottom') {
      const newEdge: Edge = {
        id: `${parentNodeId}-${newNodeId}`,
        source: parentNodeId,
        target: newNodeId,
        type: 'smoothstep',
      };
      setEdges(prev => [...prev, newEdge]);
      console.log('🔗 Created edge:', newEdge);
    }

    console.log('✅ Node creation complete');
  }, [nodes, setNodes, setEdges]);

  // Make sure the initial home node has the callback
  React.useEffect(() => {
    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onAddNode: handleAddNode,
        }
      }))
    );
  }, [handleAddNode, setNodes]);

  console.log('🎯 Current nodes:', nodes);
  console.log('🎯 Current edges:', edges);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
        <h2>Debug Sitemap Editor</h2>
        <p>Nodes: {nodes.length} | Edges: {edges.length}</p>
        <p>Check console for detailed logs</p>
      </div>
      
      <div style={{ height: 'calc(100vh - 80px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DebugEditorCanvas;