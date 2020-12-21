import { LibsRegistry } from './LibsRegistry'

const libsRegistry = new LibsRegistry('2.0.0')

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Libraries registry', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Registers a valid library', () => {
    const validPackageJson = {
      dependencies: {
        '@zeainc/zea-engine': '^2.0.0',
      },
      name: 'fake-lib',
      version: '0.0.1',
    }

    libsRegistry.registerLib(validPackageJson)

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(libsRegistry.listLibs()).toMatchSnapshot()
  })

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('Rejects an invalid library', () => {
    const invalidPackageJson = {
      dependencies: {
        '@zeainc/zea-engine': '^3.0.0',
      },
      name: 'fake-lib',
      version: '0.0.1',
    }

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(() => {
      libsRegistry.registerLib(invalidPackageJson)
    }).toThrow()
  })
})
