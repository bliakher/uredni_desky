
export interface CancelablePromise {
  promise: Promise<any>;
  cancel: () => void;
}

export const makeCancelable: (promise: Promise<any>) => CancelablePromise = (promise: Promise<any>) => {
    let hasCanceled_ = false;
  
    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(
        val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
        error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
      );
    });
  
    return {
      promise: wrappedPromise,
      cancel() {
        hasCanceled_ = true;
      },
    };
  };