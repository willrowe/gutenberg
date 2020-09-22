/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalGetBlockLabel as getBlockLabel,
	getBlockType,
} from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import { last } from 'lodash';

function getBlockDisplayText( block ) {
	return block
		? getBlockLabel( getBlockType( block.name ), block.attributes )
		: null;
}

// We want to show information in the header if we are editing a "template area."
const TEMPLATE_AREAS = [ 'core/template-part', 'core/post-content' ];

function useSecondaryText() {
	const {
		selectedBlock,
		getBlockParentsByBlockName,
		getBlockWithoutInnerBlocks,
	} = useSelect( ( select ) => {
		return {
			selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
			getBlockParentsByBlockName: select( 'core/block-editor' )
				.getBlockParentsByBlockName,
			getBlockWithoutInnerBlocks: select( 'core/block-editor' )
				.__unstableGetBlockWithoutInnerBlocks,
		};
	} );

	// Check if current block is a template area:
	const selectedBlockLabel = TEMPLATE_AREAS.includes( selectedBlock?.name )
		? getBlockDisplayText( selectedBlock )
		: null;

	if ( selectedBlockLabel ) {
		return {
			label: selectedBlockLabel,
			isActive: true,
		};
	}

	// Check if an ancestor of the current block is a template area:
	const templatePartParents = !! selectedBlock
		? getBlockParentsByBlockName( selectedBlock?.clientId, TEMPLATE_AREAS )
		: [];

	if ( templatePartParents.length ) {
		// templatePartParents is in order from top to bottom, so the closest
		// parent is at the end.
		const closestParent = getBlockWithoutInnerBlocks(
			last( templatePartParents )
		);
		return {
			label: getBlockDisplayText( closestParent ),
			isActive: true,
		};
	}

	return {};
}

export default function DocumentActions( { documentTitle } ) {
	const { label, isActive } = useSecondaryText();
	// Title is active when there is no secondary item, or when the secondary
	// item is inactive.
	const isTitleActive = ! label?.length || ! isActive;
	return (
		<div
			className={ classnames( 'edit-site-document-actions', {
				'has-secondary-label': !! label,
			} ) }
		>
			{ documentTitle ? (
				<>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__title',
							{
								'is-active': isTitleActive,
							}
						) }
					>
						{ documentTitle }
					</div>
					<div
						className={ classnames(
							'edit-site-document-actions__label',
							'edit-site-document-actions__secondary-item',
							{
								'is-active': isActive,
							}
						) }
					>
						{ label ?? '' }
					</div>
				</>
			) : (
				__( 'Loading…' )
			) }
		</div>
	);
}
