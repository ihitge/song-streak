import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Canvas,
  Group,
  Line,
  vec,
} from '@shopify/react-native-skia';
import { Colors } from '@/constants/Colors';
import {
  MasteryPath,
  MasteryNode,
  NodeStatus,
  THEORY_NODES,
  TECHNIQUE_NODES,
  PERFORMANCE_NODES,
  PATH_COLORS,
  PATH_ANGLES,
} from '@/types/mastery';
import { SkillNode } from './SkillNode';
import { StarRating } from './StarRating';

interface SkillTreeProps {
  songId: string;
  completedNodeIds: string[];
  starRating: 0 | 1 | 2 | 3;
  size?: 'compact' | 'full';
  onNodePress?: (node: MasteryNode) => void;
  getNodeStatus: (nodeId: string) => NodeStatus;
}

const NODE_SIZE = {
  compact: 36,
  full: 48,
};

const NODE_SPACING = {
  compact: 28,
  full: 44,
};

/**
 * Radial skill tree showing all three mastery paths
 */
export const SkillTree: React.FC<SkillTreeProps> = ({
  songId,
  completedNodeIds,
  starRating,
  size = 'full',
  onNodePress,
  getNodeStatus,
}) => {
  const nodeSize = NODE_SIZE[size];
  const nodeSpacing = NODE_SPACING[size];
  const isCompact = size === 'compact';

  // Calculate tree dimensions
  const centerSize = isCompact ? 40 : 60;
  const pathLength = nodeSpacing * (isCompact ? 3 : 5); // Show fewer nodes in compact
  const treeSize = (pathLength + centerSize) * 2 + nodeSize;
  const center = treeSize / 2;

  // Get position for a node based on path and position
  const getNodePosition = (path: MasteryPath, position: number) => {
    const angle = (PATH_ANGLES[path] * Math.PI) / 180;
    const distance = centerSize / 2 + nodeSpacing * position;

    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
    };
  };

  // Get nodes to display (all for full, first 3 for compact)
  const getDisplayNodes = (nodes: MasteryNode[]) => {
    return isCompact ? nodes.slice(0, 3) : nodes;
  };

  // Render path branch with connecting lines
  const renderPath = (nodes: MasteryNode[], path: MasteryPath) => {
    const displayNodes = getDisplayNodes(nodes);
    const pathColor = PATH_COLORS[path];

    return (
      <Group key={path}>
        {/* Connecting lines */}
        {displayNodes.map((node, index) => {
          if (index === 0) return null;

          const prevPos = getNodePosition(path, index - 1);
          const currPos = getNodePosition(path, index);
          const prevStatus = getNodeStatus(displayNodes[index - 1].id);
          const isCompleted = prevStatus === 'completed';

          return (
            <Line
              key={`line-${node.id}`}
              p1={vec(prevPos.x, prevPos.y)}
              p2={vec(currPos.x, currPos.y)}
              color={isCompleted ? pathColor : '#444444'}
              style="stroke"
              strokeWidth={isCompleted ? 3 : 2}
              opacity={isCompleted ? 1 : 0.5}
            />
          );
        })}

        {/* Line from center to first node */}
        {displayNodes.length > 0 && (
          <Line
            p1={vec(center, center)}
            p2={vec(
              getNodePosition(path, 0).x,
              getNodePosition(path, 0).y
            )}
            color="#333333"
            style="stroke"
            strokeWidth={2}
            opacity={0.3}
          />
        )}
      </Group>
    );
  };

  return (
    <View style={[styles.container, { width: treeSize, height: treeSize + (isCompact ? 20 : 40) }]}>
      {/* Canvas for lines */}
      <Canvas style={{ width: treeSize, height: treeSize, position: 'absolute' }}>
        <Group>
          {renderPath(THEORY_NODES, 'theory')}
          {renderPath(TECHNIQUE_NODES, 'technique')}
          {renderPath(PERFORMANCE_NODES, 'performance')}
        </Group>
      </Canvas>

      {/* Center star rating */}
      <View style={[styles.centerNode, { left: center - centerSize / 2, top: center - centerSize / 2, width: centerSize, height: centerSize }]}>
        <StarRating rating={starRating} size={isCompact ? 'small' : 'medium'} />
      </View>

      {/* Theory path nodes */}
      {getDisplayNodes(THEORY_NODES).map((node, index) => {
        const pos = getNodePosition('theory', index);
        return (
          <View
            key={node.id}
            style={[
              styles.nodeContainer,
              { left: pos.x - nodeSize / 2, top: pos.y - nodeSize / 2 },
            ]}
          >
            <SkillNode
              node={node}
              status={getNodeStatus(node.id)}
              size={nodeSize}
              showLabel={!isCompact && index === 0}
              onPress={() => onNodePress?.(node)}
            />
          </View>
        );
      })}

      {/* Technique path nodes */}
      {getDisplayNodes(TECHNIQUE_NODES).map((node, index) => {
        const pos = getNodePosition('technique', index);
        return (
          <View
            key={node.id}
            style={[
              styles.nodeContainer,
              { left: pos.x - nodeSize / 2, top: pos.y - nodeSize / 2 },
            ]}
          >
            <SkillNode
              node={node}
              status={getNodeStatus(node.id)}
              size={nodeSize}
              showLabel={!isCompact && index === 0}
              onPress={() => onNodePress?.(node)}
            />
          </View>
        );
      })}

      {/* Performance path nodes */}
      {getDisplayNodes(PERFORMANCE_NODES).map((node, index) => {
        const pos = getNodePosition('performance', index);
        return (
          <View
            key={node.id}
            style={[
              styles.nodeContainer,
              { left: pos.x - nodeSize / 2, top: pos.y - nodeSize / 2 },
            ]}
          >
            <SkillNode
              node={node}
              status={getNodeStatus(node.id)}
              size={nodeSize}
              showLabel={!isCompact && index === 0}
              onPress={() => onNodePress?.(node)}
            />
          </View>
        );
      })}

      {/* Path labels (full view only) */}
      {!isCompact && (
        <View style={styles.labelsContainer}>
          <Text style={[styles.pathLabel, { color: PATH_COLORS.theory }]}>
            Theory
          </Text>
          <Text style={[styles.pathLabel, { color: PATH_COLORS.technique }]}>
            Technique
          </Text>
          <Text style={[styles.pathLabel, { color: PATH_COLORS.performance }]}>
            Performance
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  centerNode: {
    position: 'absolute',
    backgroundColor: Colors.charcoal,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#444444',
  },
  nodeContainer: {
    position: 'absolute',
  },
  labelsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  pathLabel: {
    fontFamily: 'LexendDeca-Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
