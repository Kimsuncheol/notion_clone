import { Plugin } from 'unified';
import { Element, Text } from 'hast';
import { visit } from 'unist-util-visit';

export const rehypeRemoveNbspInCode: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      // if the node is a code element, remove the nbsp characters
      if (node.tagName === 'code') {
        // 'code' 태그 내부의 모든 텍스트 노드를 순회합니다.
        visit(node, 'text', (textNode: Text) => {
          // 1. 여러 줄바꿈을 유발하는 패턴을 단일 줄바꿈으로 변경합니다.
          let processedValue = textNode.value.replaceAll(/\n\u00A0\n\n/g, '\n');

          // 2. 남아있는 모든 nbsp(Non-breaking space) 문자를 일반 공백으로 바꿉니다.
          processedValue = processedValue.replaceAll(/\u00A0/g, ' ');

          textNode.value = processedValue;
        });
      }
    });
  };
}

