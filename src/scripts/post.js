const md = require( "markdown-it" )({
	html: true,
	typographer: true,
});

const striptags = require( "striptags" );

class Post
{
	constructor( document )
	{
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
			excerpt = striptags(
				md.render(
					content[0]
					.split( /[\.\n]/ )[0]
				)
			);
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
		let mm = this.date.getMonth().toString().padStart( 2, "0" );

		return `/${yyyy}/${mm}/${this.slug}`;
	}
}

module.exports = Post;
