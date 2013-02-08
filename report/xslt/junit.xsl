<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="xml" indent="yes" />
	
	<xsl:param name="failure-limit" />
	<xsl:param name="skip" />
	<xsl:param name="rules-file" />
	<xsl:param name="dictionary" select="document($rules-file,/)"/>
	<xsl:template match="/">
		<testsuites>
			<xsl:apply-templates />
		</testsuites>
	</xsl:template>

	<xsl:template match="results">
		<xsl:variable name="url" select="substring-before(concat(curl, '?'), '?')" />
		<xsl:variable name="tests" select="count(g/*)" />
		<xsl:variable name="failures" select="count(g/*[score&lt;$failure-limit])" />
		<xsl:variable name="skipped" select="count(g/*[contains($skip,name(.))])" />
		<testsuite name="sitespeed.io-{$url}" tests="{$tests}"
			failures="{$failures}" skipped="{$skipped}">
			<xsl:apply-templates />
		</testsuite>
	</xsl:template>

	<xsl:template match="g/*">
		<xsl:variable name="testkey" select="name(.)" />
		<xsl:variable name="testname" select="$dictionary/results/dictionary/rules/*[contains($testkey,name(.))]/name" />
		<xsl:variable name="score" select="score" />
		<testcase name="{$testkey}: {$testname}" status="{$score}">
			<!-- Checked if skipped -->
			<xsl:if test="contains($skip,$testkey)">
				<skipped></skipped>
			</xsl:if>
			<xsl:if test="$score&lt;$failure-limit">
				<xsl:variable name="message" select="message" />

				<failure message="{$message}">
					<xsl:for-each select="components/item">
						<xsl:text>&#xa;</xsl:text>
						<xsl:value-of select="." />
					</xsl:for-each>
				</failure>
			</xsl:if>
		</testcase>
	</xsl:template>

	<xsl:template match="stats|comps|w_c|r_c|stats_c">
	<!-- skip these -->
	</xsl:template>
	
</xsl:stylesheet>




