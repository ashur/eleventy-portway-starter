const dotenv = require( "dotenv" );
const Documents = require( "../_scripts/documents" );
const Page = require( "../_scripts/page" );

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
		"PORTWAY_PAGES_KEY",
		"PORTWAY_PAGES_ID",
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
		console.log( "⚠️  Including unpublished pages" );
	};

	try
	{
		let populatedDocuments = await Documents.fetch({
			apiKey: process.env.PORTWAY_PAGES_KEY,
			projectId: process.env.PORTWAY_PAGES_ID,
			showDrafts: showDrafts,
		});

		return populatedDocuments
			.map( populatedDocument =>
			{
				if( !populatedDocument.data )
				{
					throw new Error( "Unexpected response from Portway:", populatedDocument );
				}

				return new Page( populatedDocument.data );
			});
	}
	catch( error )
	{
		console.error( error );
		return [];
	}
};
