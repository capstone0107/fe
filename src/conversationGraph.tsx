import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType, // MarkerType is an Enum, so it's a value! Keep it here.
} from 'reactflow';

// Separate type import
import type {
    Node,
    Edge,
    NodeMouseHandler,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './App.css';
// Define the data structures expected from the backend
interface GraphNodeData {
    label: string;
    description: string;
    related_message_indices?: number[];
    conversation_id?: string;
}

interface GraphProps {
    data: {
        nodes: { id: string; label: string; description: string; conversation_id?: string }[];
        edges: { source: string; target: string; label: string }[];
    };
    onClose: () => void;
}

const ConversationGraph = ({ data, onClose }: GraphProps) => {
    // React Flow hooks for managing nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node<GraphNodeData> | null>(null);

    // Transform backend data into React Flow format when data prop changes
    useEffect(() => {
        if (!data) return;

        // Simple grid layout calculation
        // For a more complex auto-layout, you'd use a library like 'dagre'
        const layoutedNodes: Node[] = data.nodes.map((node, index) => ({
            id: node.id,
            // Arrange nodes in a grid: 3 nodes per row
            position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 150 },
            data: { 
                label: node.label, 
                description: node.description,
                conversation_id: node.conversation_id
            },
            style: { 
                background: '#fff', 
                border: '1px solid #777', 
                borderRadius: '8px',
                padding: '10px',
                width: 200,
                fontSize: '14px',
                textAlign: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            },
            type: 'default'
        }));

        const layoutedEdges: Edge[] = data.edges.map((edge, index) => ({
            id: `e${index}`,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            type: 'smoothstep', // Nice curved edges
            animated: true,
            style: { stroke: '#555' },
            labelStyle: { fill: '#555', fontWeight: 700, fontSize: '12px' },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#555',
            },
        }));

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [data, setNodes, setEdges]);

    // Handler for clicking a node
    const onNodeClick: NodeMouseHandler = useCallback((event: React.MouseEvent, node: Node) => {
        event.stopPropagation(); // Prevent clicking through to the pane
        setSelectedNode(node as Node<GraphNodeData>);
    }, []);

    // Handler for clicking the background (to deselect)
    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    return (
        <div className="graph-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView // Automatically zoom/pan to fit all nodes
            >
                <Controls />
                <MiniMap nodeColor={(_n: Node) => '#3b82f6'} />
                <Background gap={16} size={1} color="#e5e7eb" />
            </ReactFlow>

            {/* Info Panel Overlay */}
            {selectedNode && (
                <div className="node-details-panel">
                    <div className="panel-header">
                        <h4>{selectedNode.data.label}</h4>
                        <button className="close-panel-btn" onClick={() => setSelectedNode(null)}>×</button>
                    </div>
                    <div className="panel-content">
                        <p className="panel-description">{selectedNode.data.description}</p>
                        {selectedNode.data.conversation_id && (
                            <span className="panel-badge">From: {selectedNode.data.conversation_id}</span>
                        )}
                    </div>
                </div>
            )}
            
            <button className="close-graph-btn" onClick={onClose}>
                닫기
            </button>
        </div>
    );
};

export default ConversationGraph;