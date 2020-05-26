/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { parse, createBlock } from '@wordpress/blocks';
import { useMemo, useCallback } from '@wordpress/element';
import { ENTER, SPACE } from '@wordpress/keycodes';
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import BlockPreview from '../block-preview';
import InserterPanel from './panel';

/**
 * External dependencies
 */
import { groupBy } from 'lodash';

function TemplatePartItem( { templatePart, onInsert } ) {
	const { id, slug, theme } = templatePart;
	const content = templatePart.content.raw || '';
	const blocks = useMemo( () => parse( content ), [ content ] );
	const { createSuccessNotice } = useDispatch( 'core/notices' );

	const onClick = useCallback( () => {
		const templatePartBlock = createBlock( 'core/template-part', {
			postId: id,
			slug,
			theme,
		} );
		onInsert( templatePartBlock );
		createSuccessNotice(
			sprintf(
				/* translators: %s: template part title. */
				__( 'Template Part "%s" inserted.' ),
				slug
			),
			{
				type: 'snackbar',
			}
		);
	}, [ id, slug, theme ] );

	return (
		<div
			className="block-editor-inserter__template-part-item"
			role="button"
			onClick={ onClick }
			onKeyDown={ ( event ) => {
				if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
					onClick();
				}
			} }
			tabIndex={ 0 }
			aria-label={ templatePart.slug }
		>
			<BlockPreview blocks={ blocks } />
			<div className="block-editor-inserter__template-part-item-title">
				{ templatePart.slug }
			</div>
		</div>
	);
}

export default function TemplateParts( { onInsert } ) {
	const templateParts = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords(
			'postType',
			'wp_template_part',
			{
				status: [ 'publish', 'auto-draft' ],
			}
		);
	}, [] );

	// Group by Theme.
	const templatePartsByTheme = useMemo( () => {
		return Object.values( groupBy( templateParts, 'meta.theme' ) );
	}, [ templateParts ] );

	return (
		<>
			{ templatePartsByTheme.length &&
				templatePartsByTheme.map( ( templatePartList ) => (
					<InserterPanel
						key={ templatePartList[ 0 ].meta.theme }
						title={ templatePartList[ 0 ].meta.theme }
					>
						{ templatePartList.map( ( templatePart ) => (
							<TemplatePartItem
								key={ templatePart.id }
								templatePart={ templatePart }
								onInsert={ onInsert }
							/>
						) ) }
					</InserterPanel>
				) ) }
		</>
	);
}