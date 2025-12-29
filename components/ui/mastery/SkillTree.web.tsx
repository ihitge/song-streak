import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
 * Radial skill tree showing all three mastery paths - Web fallback using CSS
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
  const pathLength = nodeSpacing * (isCompact ? 3 : 5);
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

  // Render connecting line with CSS
  const renderLine = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    isCompleted: boolean,
    pathColor: string,
    key: string
  ) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return (
      <View
        key={key}
        style={[
          styles.line,
          {
            width: length,
            height: isCompleted ? 3 : 2,
            left: startX,
            top: startY - (isCompleted ? 1.5 : 1),
            transform: [{ rotate: `${angle}deg` }],
            backgroundColor: isCompleted ? pathColor : '#444444',
            opacity: isCompleted ? 1 : 0.5,
          },
        ]}
      />
    );
  };

  // Render path lines
  const renderPathLines = (nodes: MasteryNode[], path: MasteryPath) => {
    const displayNodes = getDisplayNodes(nodes);
    const pathColor = PATH_COLORS[path];
    const lines: React.ReactNode[] = [];

    // Line from center to first node
    if (displayNodes.length > 0) {
      const firstPos = getNodePosition(path, 0);
      lines.push(
        renderLine(center, center, firstPos.x, firstPos.y, false, pathColor, `line-${path}-center`)
      );
    }

    // Lines between nodes
    displayNodes.forEach((node, index) => {
      if (index === 0) return;

      const prevPos = getNodePosition(path, index - 1);
      const currPos = getNodePosition(path, index);
      const prevNodeId = displayNodes[index - 1].id;
      const isCompleted = completedNodeIds.includes(prevNodeId);

      lines.push(
        renderLine(
          prevPos.x,
          prevPos.y,
          currPos.x,
          currPos.y,
          isCompleted,
          pathColor,
          `line-${node.id}`
        )
      );
    });

    return lines;
  };

  return (
    <View style={[styles.container, { width: treeSize, height: treeSize + (isCompact ? 20 : 40) }]}>
      {/* Lines container */}
      <View style={[styles.linesContainer, { width: treeSize, height: treeSize }]}>
        {renderPathLines(THEORY_NODES, 'theory')}
        {renderPathLines(TECHNIQUE_NODES, 'technique')}
        {renderPathLines(PERFORMANCE_NODES, 'performance')}
      </View>

      {/* Center star rating */}
      <View
        style={[
          styles.centerNode,
          {
            left: center - centerSize / 2,
            top: center - centerSize / 2,
            width: centerSize,
            height: centerSize,
          },
        ]}
      >
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
          <Text style={[styles.pathLabel, { color: PATH_COLORS.theory }]}>Theory</Text>
          <Text style={[styles.pathLabel, { color: PATH_COLORS.technique }]}>Technique</Text>
          <Text style={[styles.pathLabel, { color: PATH_COLORS.performance }]}>Performance</Text>
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
  linesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  line: {
    position: 'absolute',
    transformOrigin: 'left center',
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
