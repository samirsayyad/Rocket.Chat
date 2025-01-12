import type * as MessageParser from '@rocket.chat/message-parser';
import { Fragment, ReactElement } from 'react';

import PreviewCodeElement from '../code/PreviewCodeElement';
import PreviewColorElement from '../colors/PreviewColorElement';
import PreviewEmojiElement from '../emoji/PreviewEmojiElement';
import PreviewKatexElement from '../katex/PreviewKatexElement';
import PreviewChannelMentionElement from '../mentions/PreviewChannelMentionElement';
import PreviewUserMentionElement from '../mentions/PreviewUserMentionElement';

type PreviewInlineElementsProps = {
	children: MessageParser.Inlines[];
};

const PreviewInlineElements = ({ children }: PreviewInlineElementsProps): ReactElement => (
	<>
		{children.map((child, index) => {
			switch (child.type) {
				case 'BOLD':
				case 'ITALIC':
				case 'STRIKE':
					return <PreviewInlineElements key={index} children={child.value} />;

				case 'LINK':
					return <PreviewInlineElements key={index} children={[child.value.label]} />;

				case 'PLAIN_TEXT':
					return <Fragment key={index} children={child.value} />;

				case 'IMAGE':
					return <PreviewInlineElements key={index} children={[child.value.label]} />;

				case 'MENTION_USER':
					return <PreviewUserMentionElement key={index} mention={child.value.value} />;

				case 'MENTION_CHANNEL':
					return <PreviewChannelMentionElement key={index} mention={child.value.value} />;

				case 'INLINE_CODE':
					return <PreviewCodeElement key={index} code={child.value.value} />;

				case 'EMOJI':
					return <PreviewEmojiElement key={index} {...child} />;

				case 'COLOR':
					return <PreviewColorElement key={index} {...child.value} />;

				case 'INLINE_KATEX':
					return <PreviewKatexElement key={index} code={child.value} />;

				default:
					return null;
			}
		})}
	</>
);

export default PreviewInlineElements;
