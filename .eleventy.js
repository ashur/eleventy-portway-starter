const CleanCSS = require( "clean-css" );
const markdownIt = require( "markdown-it" );

module.exports = config =>
{
	config.addPassthroughCopy( "src/icons" );

	/* Filters & Shortcodes */
	config.addFilter( "cssmin", code =>
	{
		return new CleanCSS({})
			.minify( code )
			.styles;
	});

	config.addShortcode( "date", date =>
	{
		return date.toLocaleDateString( [], {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	});

	/* Markdown configuration */
	let markdownOptions = {
		html: true,
		breaks: false,
		typographer: true,
	};

	let markdownLibrary = markdownIt( markdownOptions )
		.disable( "code" );

	markdownLibrary.use( require( "markdown-it-anchor" ) );

	config.setLibrary( "md", markdownLibrary );

	return {
		dir: {
			input: "src",
			output: "dist",
		},

		markdownTemplateEngine: "njk",
		templateFormats: ["njk", "md"],
	};
};
