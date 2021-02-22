const CleanCSS = require( "clean-css" );
const markdownIt = require( "markdown-it" );
const rssPlugin = require( "@11ty/eleventy-plugin-rss" );

module.exports = config =>
{
	config.addPassthroughCopy( "src/icons" );
	config.addPassthroughCopy({ "src/static": "/" });

	config.addPlugin( rssPlugin, {
		posthtmlRenderOptions: {}
	});

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

	config.addFilter( "dateFromString", string =>
	{
		return new Date( string );
	});

	config.addFilter( "slice", (array, start, end) =>
	{
		return array.slice( start, end );
	});

	config.addFilter( "sortPages", pages =>
	{
		return pages.sort( (pageA, pageB) =>
		{
			let sortPageA = pageA.data.sort || 0;
			let sortPageB = pageB.data.sort || 0;

			return sortPageA - sortPageB;
		});
	});

	config.addFilter( "sortPosts", (posts, property="date", order="desc") =>
	{
		return posts.sort( (postA, postB) =>
		{
			let sortPostA = postA[property];
			let sortPostB = postB[property];

			if( order === "desc" )
			{
				return sortPostB - sortPostA;
			}

			return sortPostA - sortPostB;
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
	markdownLibrary.use( require( "markdown-it-attrs" ) );

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
