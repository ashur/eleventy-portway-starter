const md = require( "markdown-it" )({
	html: true,
	typographer: true,
});

md.use( require( "markdown-it-anchor" ) );

const striptags = require( "striptags" );

class Post
{
	constructor( document )
	{
		this.documentUrl = `https://portway.app/d/project/${document.projectId}/document/${document.id}`

		this.name = document.name;
		this.slug = document.slug;

		this.data = {};

		let content = [];
		let fields = document.fields || [];
		let images = [];

		fields.forEach( field =>
		{
			if( field.type === 2 )
			{
				content.push( field.value );
			}
			else if( field.type === 4 )
			{
				images.push({
					src: field.value,
					description: field.name,
				});

				content.push(
					`<img alt="${field.name}" src="${field.value}">`
				);
			}
			else
			{
				this.data[field.name] = field.value;
			}
		});

		this.content = content.join( "\n\n" );
		this.html = md.render( this.content );

		/* Excerpt */
		let excerpt = this.data.excerpt;
		if( !excerpt && content[0] )
		{
			excerpt = striptags( this.html )
				.split( /[\.\n]/ )[0];
		}
		this.excerpt = excerpt;

		/* Image */
		if( images.length > 0 )
		{
			this.image = images[0];
		}

		/* Date */
		let date = document.createdAt;
		if( this.data.date )
		{
			date = this.data.date;
		}

		this.date = new Date( date );
		this.isPublished = document.publishedVersionId !== null;
	}

	get permalink()
	{
		let yyyy = this.date.getFullYear();
		let month = this.date.getMonth() + 1;
		let mm = month.toString().padStart( 2, "0" );

		return `/${yyyy}/${mm}/${this.slug}`;
	}
}

module.exports = Post;
