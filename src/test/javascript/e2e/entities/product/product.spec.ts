import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import ProductComponentsPage, { ProductDeleteDialog } from './product.page-object';
import ProductUpdatePage from './product-update.page-object';
import {
  waitUntilDisplayed,
  waitUntilAnyDisplayed,
  click,
  getRecordsCount,
  waitUntilHidden,
  waitUntilCount,
  isVisible
} from '../../util/utils';
import path from 'path';

const expect = chai.expect;

describe('Product e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let productComponentsPage: ProductComponentsPage;
  let productUpdatePage: ProductUpdatePage;
  let productDeleteDialog: ProductDeleteDialog;
  const fileToUpload = '../../../../../../src/main/webapp/content/images/logo-jhipster.png';
  const absolutePath = path.resolve(__dirname, fileToUpload);
  let beforeRecordsCount = 0;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();

    await signInPage.username.sendKeys('admin');
    await signInPage.password.sendKeys('admin');
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();
    await waitUntilDisplayed(navBarPage.entityMenu);
    await waitUntilDisplayed(navBarPage.adminMenu);
    await waitUntilDisplayed(navBarPage.accountMenu);
  });

  it('should load Products', async () => {
    await navBarPage.getEntityPage('product');
    productComponentsPage = new ProductComponentsPage();
    expect(await productComponentsPage.title.getText()).to.match(/Products/);

    expect(await productComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilAnyDisplayed([productComponentsPage.noRecords, productComponentsPage.table]);

    beforeRecordsCount = (await isVisible(productComponentsPage.noRecords)) ? 0 : await getRecordsCount(productComponentsPage.table);
  });

  it('should load create Product page', async () => {
    await productComponentsPage.createButton.click();
    productUpdatePage = new ProductUpdatePage();
    expect(await productUpdatePage.getPageTitle().getAttribute('id')).to.match(/storeApp.product.home.createOrEditLabel/);
    await productUpdatePage.cancel();
  });

  it('should create and save Products', async () => {
    await productComponentsPage.createButton.click();
    await productUpdatePage.setNameInput('name');
    expect(await productUpdatePage.getNameInput()).to.match(/name/);
    await productUpdatePage.setDescriptionInput('description');
    expect(await productUpdatePage.getDescriptionInput()).to.match(/description/);
    await productUpdatePage.setPriceInput('5');
    expect(await productUpdatePage.getPriceInput()).to.eq('5');
    await productUpdatePage.sizeSelectLastOption();
    await productUpdatePage.setImageInput(absolutePath);
    await productUpdatePage.productCategorySelectLastOption();
    await waitUntilDisplayed(productUpdatePage.saveButton);
    await productUpdatePage.save();
    await waitUntilHidden(productUpdatePage.saveButton);
    expect(await isVisible(productUpdatePage.saveButton)).to.be.false;

    expect(await productComponentsPage.createButton.isEnabled()).to.be.true;

    await waitUntilDisplayed(productComponentsPage.table);

    await waitUntilCount(productComponentsPage.records, beforeRecordsCount + 1);
    expect(await productComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);
  });

  it('should delete last Product', async () => {
    const deleteButton = productComponentsPage.getDeleteButton(productComponentsPage.records.last());
    await click(deleteButton);

    productDeleteDialog = new ProductDeleteDialog();
    await waitUntilDisplayed(productDeleteDialog.deleteModal);
    expect(await productDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/storeApp.product.delete.question/);
    await productDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(productDeleteDialog.deleteModal);

    expect(await isVisible(productDeleteDialog.deleteModal)).to.be.false;

    await waitUntilAnyDisplayed([productComponentsPage.noRecords, productComponentsPage.table]);

    const afterCount = (await isVisible(productComponentsPage.noRecords)) ? 0 : await getRecordsCount(productComponentsPage.table);
    expect(afterCount).to.eq(beforeRecordsCount);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
