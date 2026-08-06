import { test, expect } from '@playwright/test'

test.describe('Portal público', () => {
  test('la portada carga con la identidad de la Corporación', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Deportes de San Joaquín/)

    const titular = page.locator('h1').first()
    await expect(titular).toContainText('Corporación Municipal de Deportes de San Joaquín')
  })

  test('el idioma declarado es español de Chile', async ({ page }) => {
    await page.goto('http://localhost:3000')

    /* Importa para los lectores de pantalla: con lang mal declarado, VoiceOver
       lee los titulares en inglés. */
    await expect(page.locator('html')).toHaveAttribute('lang', 'es-CL')
  })
})
