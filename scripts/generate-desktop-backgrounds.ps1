# Extend only the original Figma background shapes beyond the content column.
# Images, text, icons and card surfaces are deliberately never copied.
$courseDirectory = Join-Path $PSScriptRoot '..\public\course'
$svgNamespace = 'http://www.w3.org/2000/svg'

foreach ($page in @('home', 'lessons')) {
    $source = [xml](Get-Content -Raw -LiteralPath (Join-Path $courseDirectory "$page-desktop.svg"))
    $output = [System.Xml.XmlDocument]::new()
    $svg = $output.CreateElement('svg', $svgNamespace)
    $svg.SetAttribute('viewBox', "-1920 0 5760 $($source.DocumentElement.GetAttribute('height'))")
    $svg.SetAttribute('preserveAspectRatio', 'none')
    [void]$output.AppendChild($svg)

    foreach ($sourceGroup in @($source.DocumentElement.ChildNodes | Where-Object LocalName -eq 'g')) {
        $group = $output.ImportNode($sourceGroup, $false)
        foreach ($node in $sourceGroup.ChildNodes) {
            $isSurface = $node.LocalName -eq 'rect' -and $node.GetAttribute('width') -eq '1920'
            $isGlow = $node.LocalName -eq 'g' -and $node.HasAttribute('filter')
            $isDivider = $node.LocalName -eq 'line' -and $node.GetAttribute('x2') -eq '1920'
            if (-not ($isSurface -or $isGlow -or $isDivider)) { continue }
            $copy = $output.ImportNode($node, $true)
            if ($isSurface) {
                $copy.SetAttribute('x', '-1920')
                $copy.SetAttribute('width', '5760')
            }
            if ($isDivider) {
                $copy.SetAttribute('x1', '-1920')
                $copy.SetAttribute('x2', '3840')
            }
            [void]$group.AppendChild($copy)
        }
        [void]$svg.AppendChild($group)
    }

    $defs = $output.CreateElement('defs', $svgNamespace)
    foreach ($node in $source.DocumentElement.defs.ChildNodes) {
        if ($node.LocalName -in @('filter', 'radialGradient')) {
            [void]$defs.AppendChild($output.ImportNode($node, $true))
        }
        if ($node.LocalName -eq 'clipPath' -and $node.rect.GetAttribute('width') -eq '1920') {
            $copy = $output.ImportNode($node, $true)
            $copy.FirstChild.SetAttribute('x', '-1920')
            $copy.FirstChild.SetAttribute('width', '5760')
            [void]$defs.AppendChild($copy)
        }
    }
    [void]$svg.AppendChild($defs)
    $target = Join-Path $courseDirectory "$page-background-wide.svg"
    $settings = [System.Xml.XmlWriterSettings]::new()
    $settings.Indent = $true
    $settings.OmitXmlDeclaration = $true
    $settings.Encoding = [System.Text.UTF8Encoding]::new($false)
    $writer = [System.Xml.XmlWriter]::Create($target, $settings)
    try { $output.Save($writer) } finally { $writer.Dispose() }
    Write-Output "$page-background-wide.svg"
}
