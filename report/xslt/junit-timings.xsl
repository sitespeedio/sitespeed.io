<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="xml" indent="yes" />

	<!--The file to fetch the limits from-->
	<xsl:param name="limits-file"/>
	<xsl:param name="limits" select="document($limits-file,/)"/>

	<xsl:template match="metrics">
		<testsuites>
			<xsl:apply-templates />
		</testsuites>
	</xsl:template>

	<xsl:template name="results" match="timingSession">
		<xsl:variable name="url" select="pageData/entry[key='url']/value"/>
		<!-- Replacing all . with _ for better junit results -->
		<xsl:variable name="junit-url">
            <xsl:call-template name="string-replace-all">
                <xsl:with-param name="text" select="$url"/>
                <xsl:with-param name="replace">.</xsl:with-param>
                <xsl:with-param name="by" select="'_'"/>
            </xsl:call-template>
        </xsl:variable>

		<testsuite name="sitespeed&#46;io.timings.{$junit-url}" >
		<xsl:apply-templates/>
		</testsuite>
	</xsl:template>

	<xsl:template name="stats" match="statistics/statistic">
		<xsl:variable name="name" select="name" />
		<xsl:variable name="limit-type" select="$limits/limits/@type"/>	
	
		<xsl:variable name="time" select="*[name(.)=$limit-type]" />
		<xsl:variable name="time-in-seconds" select="$time div 1000"/>
		<xsl:variable name="url" select="../../pageData/entry[key='url']/value" />
		<xsl:variable name="browser" select="../../pageData/entry[key='browserName']/value"/>
		<xsl:variable name="version" select="../../pageData/entry[key='browserVersion']/value"/>
		<xsl:variable name="tries" select="count(../../runs/run)"/>

		<!-- First check if we have specific values configured for that URL else use the default ones -->
		<xsl:variable name="exist" select="boolean($limits/limits/urls/page[url=$url])"/>

		<xsl:choose>
		        <xsl:when test="$exist">
					<xsl:for-each select="$limits/limits/urls/page[url=$url]/limits/*">
				
						<xsl:if test="name(.)=$name">
						<xsl:variable name="time-limit" select="."/>

						<testcase name="{$name}" time="{$time-in-seconds}">
						<xsl:if test="$time&gt;$time-limit">
							<failure type="failedTiming" message="The time for {$name} is {$time} ms, that is higher than your limit of {$time-limit} ms. Using {$browser} {$version} with the {$limit-type} of {$tries} runs."/>
						</xsl:if>
						</testcase>
						</xsl:if>
					</xsl:for-each>
		        </xsl:when>
		        
		        <xsl:otherwise>
					<xsl:for-each select="$limits/limits/default/*[name(.)=$name]">
						<xsl:variable name="time-limit" select="."/>
						<testcase name="{$name}" time="{$time-in-seconds}">
						<xsl:if test="$time&gt;$time-limit">
							<failure type="failedTiming" message="The time for {$name} is {$time} ms, that is higher than your limit of {$time-limit} ms. Using {$browser} {$version} with the {$limit-type} of {$tries} runs."/>
						</xsl:if>
						</testcase>
					</xsl:for-each>
		        </xsl:otherwise>
		    </xsl:choose>
	</xsl:template>

	<!-- skip these -->
	<xsl:template match="results|url|pageData|key|value"/>
	
	
<!-- Classic replace template -->
<xsl:template name="string-replace-all"> 
        <xsl:param name="text"/> 
        <xsl:param name="replace"/> 
        <xsl:param name="by"/> 
        <xsl:choose> 
            <xsl:when test="contains($text,$replace)"> 
                <xsl:value-of select="substring-before($text,$replace)"/> 
                <xsl:value-of select="$by"/> 
                <xsl:call-template name="string-replace-all"> 
                    <xsl:with-param name="text" select="substring-after($text,$replace)"/> 
                    <xsl:with-param name="replace" select="$replace"/> 
                    <xsl:with-param name="by" select="$by"/> 
                </xsl:call-template> 
            </xsl:when> 
    <xsl:otherwise> 
      <xsl:value-of select="$text"/> 
    </xsl:otherwise> 
  </xsl:choose> 
</xsl:template> 

</xsl:stylesheet>




