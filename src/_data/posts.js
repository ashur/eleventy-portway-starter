const dotenv = require( "dotenv" );
const Documents = require( "../_scripts/documents" );
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
	let requiredVarnames = [
		"PORTWAY_POSTS_ID",
		"PORTWAY_POSTS_KEY",
	];

	for( let varname of requiredVarnames )
	{
		if( !process.env[varname] )
		{
			console.log( `⚠️  Environment variable '${varname}' not found.` );
			return [];
		}
	}

	let showDrafts = process.env.PORTWAY_SHOW_DRAFTS === "true";
	if( showDrafts )
	{
		console.log( "⚠️  Including unpublished posts" );
	};

	try
	{
		let populatedDocuments = await Documents.fetch({
			apiKey: process.env.PORTWAY_POSTS_KEY,
			projectId: process.env.PORTWAY_POSTS_ID,
			showDrafts: showDrafts,
		});

		return populatedDocuments
			.map( populatedDocument =>
			{
				if( !populatedDocument.data )
				{
					throw new Error( "Unexpected response from Portway:", populatedDocument );
				}

				return new Post( populatedDocument.data );
			})
			.sort( (docA, docB) =>
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
	}
	catch( error )
	{
		console.error( error );
		return [];
	}
};
