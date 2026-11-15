<?php
/**
 * Plugin Name:       40 Darood wa Salam
 * Description:       The 40 Salawat & Salaam upon the Prophet ﷺ, with themes, Arabic fonts, highlighting and auto scroll. Add [darood_wa_salam] to any page or post.
 * Version:           1.0.0
 * Requires at least: 5.0
 * Requires PHP:      7.0
 * License:           GPL-2.0-or-later
 * Text Domain:       darood-wa-salam
 */

defined( 'ABSPATH' ) || exit;

define( 'DWS_VERSION', '1.0.0' );

/**
 * [darood_wa_salam height="85vh"]
 *
 * Shows the bundled app in a frame so the site's theme cannot affect its layout.
 */
function dws_shortcode( $atts ) {
	$atts   = shortcode_atts( array( 'height' => '85vh' ), $atts, 'darood_wa_salam' );
	$height = preg_match( '/^\d+(\.\d+)?(px|vh|em|rem)$/', $atts['height'] ) ? $atts['height'] : '85vh';
	$src    = add_query_arg( 'v', DWS_VERSION, plugins_url( 'app/index.html', __FILE__ ) );

	return sprintf(
		'<div class="dws-embed"><iframe src="%s" title="%s" loading="lazy" allow="screen-wake-lock; clipboard-write; web-share" style="display:block;width:100%%;height:%s;border:0;border-radius:12px;"></iframe></div>',
		esc_url( $src ),
		esc_attr__( '40 Darood wa Salam', 'darood-wa-salam' ),
		esc_attr( $height )
	);
}
add_shortcode( 'darood_wa_salam', 'dws_shortcode' );
