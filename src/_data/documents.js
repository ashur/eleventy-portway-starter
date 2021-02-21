const dotenv = require( "dotenv" );
const Documents = require( "../_scripts/documents" );
const Page = require( "../_scripts/page" );
const Post = require( "../_scripts/post" );

/*
 * Environment variables
 */
dotenv.config();

/**
 * Fetch documents from Portway
 *
 * @return {Promise<>Object[]}
 */
module.exports = async () =>
{
	let documents = {
		pages: [],
		posts: [],
	};

	let requiredVarnames = [
		"PORTWAY_PROJECT_ID",
		"PORTWAY_API_KEY",
	];

	for( let varname of requiredVarnames )
	{
		if( !process.env[varname] )
		{
			console.log( `⚠️  Environment variable '${varname}' not found.` );
			return documents;
		}
	}

	let showDrafts = process.env.PORTWAY_SHOW_DRAFTS === "true";
	if( showDrafts )
	{
		console.log( "⚠️  Including unpublished documents" );
	};

	try
	{
		let populatedDocuments = await Documents.fetch({
			apiKey: process.env.PORTWAY_API_KEY,
			projectId: process.env.PORTWAY_PROJECT_ID,
			showDrafts: showDrafts,
		});

		populatedDocuments.forEach( populatedDocument =>
		{
			if( !populatedDocument.data )
			{
				throw new Error( "Unexpected response from Portway:", populatedDocument );
			}

			/* Separate pages from posts */
			let fieldTypePage = populatedDocument.data.fields
				.find( field => {
					return field.name === "type"
						&& field.value.toLowerCase() === "page"
				});

			if( fieldTypePage )
			{
				let page = new Page( populatedDocument.data );
				documents.pages.push( page );
			}
			else
			{
				let post = new Post( populatedDocument.data );
				documents.posts.push( post );
			}
		});

		documents.posts.sort( (docA, docB) =>
		{
			// If only one item is pinned, sort it before the unpinned item
			if( docA.data.pinned !== "true" || docB.data.pinned !== "true" )
			{
				if( docA.data.pinned === "true" )
				{
					return -1;
				}
				else if( docB.data.pinned === "true" )
				{
					return 1;
				}
			}

			// Otherwise, fall through to date-based sorting
			// (including cases where both items are pinned)
			return docB.date - docA.date;
		});

		return documents;
	}
	catch( error )
	{
		console.error( error );
		return documents;
	}
};
